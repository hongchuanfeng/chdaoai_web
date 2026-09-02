'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

type SubtitleFormat = 'srt' | 'vtt' | 'ass'

export default function SubtitlesToText() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState('')
  const [detectedFormat, setDetectedFormat] = useState<SubtitleFormat | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 解析SRT格式
  const parseSRT = (content: string): string => {
    const lines = content.trim().split(/\r?\n/)
    const texts: string[] = []
    let i = 0
    
    while (i < lines.length) {
      // 跳过序号和时间轴
      while (i < lines.length && !lines[i].includes('-->')) {
        i++
      }
      if (i >= lines.length) break
      
      i++ // 跳过时间轴行
      
      // 收集文字直到空行
      while (i < lines.length && lines[i].trim() !== '') {
        texts.push(lines[i].trim())
        i++
      }
      i++ // 跳过空行
    }
    
    return texts.join('\n')
  }

  // 解析VTT格式
  const parseVTT = (content: string): string => {
    const lines = content.trim().split(/\r?\n/)
    const texts: string[] = []
    let i = 0
    
    // 跳过WEBVTT头部
    while (i < lines.length && !lines[i].includes('-->')) {
      i++
    }
    
    while (i < lines.length) {
      // 跳过时间轴
      while (i < lines.length && !lines[i].includes('-->')) {
        i++
      }
      if (i >= lines.length) break
      
      i++ // 跳过时间轴行
      
      // 收集文字直到空行或文件结束
      while (i < lines.length && lines[i].trim() !== '') {
        texts.push(lines[i].trim())
        i++
      }
      i++ // 跳过空行
    }
    
    return texts.join('\n')
  }

  // 解析ASS格式
  const parseASS = (content: string): string => {
    const lines = content.trim().split(/\r?\n/)
    const texts: string[] = []
    let inEvents = false
    
    for (const line of lines) {
      if (line.trim() === '[Events]') {
        inEvents = true
        continue
      }
      if (line.trim().startsWith('[') && line.trim() !== '[Events]') {
        inEvents = false
        continue
      }
      if (inEvents && line.startsWith('Dialogue:')) {
        const parts = line.split(',')
        if (parts.length >= 10) {
          // 最后一个部分是文字
          const text = parts.slice(9).join(',')
          // 移除ASS样式标签
          const cleanText = text
            .replace(/\{[^}]*\}/g, '') // 移除花括号内的样式标签
            .replace(/\\N/g, '\n') // 换行符
            .replace(/\\n/g, '\n')
            .trim()
          if (cleanText) {
            texts.push(cleanText)
          }
        }
      }
    }
    
    return texts.join('\n')
  }

  // 检测格式并解析
  const parseSubtitle = (content: string, format: SubtitleFormat): string => {
    switch (format) {
      case 'srt':
        return parseSRT(content)
      case 'vtt':
        return parseVTT(content)
      case 'ass':
        return parseASS(content)
      default:
        return content
    }
  }

  // 检测字幕格式
  const detectFormat = (content: string): SubtitleFormat | null => {
    const trimmed = content.trim()
    if (trimmed.startsWith('WEBVTT')) {
      return 'vtt'
    }
    if (trimmed.startsWith('[Script Info]') || trimmed.startsWith('[Events]')) {
      return 'ass'
    }
    // SRT格式通常以数字开头
    if (/^\d+$/.test(trimmed.split('\n')[0])) {
      return 'srt'
    }
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setResult('')
      setDetectedFormat(null)
      
      // 检测格式
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const format = detectFormat(content)
        setDetectedFormat(format)
      }
      reader.readAsText(selectedFile)
    }
  }

  const handleConvert = async () => {
    if (!file) return
    setProcessing(true)
    
    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const format = detectedFormat || detectFormat(content) || 'srt'
        const text = parseSubtitle(content, format)
        setResult(text)
        setProcessing(false)
      }
      reader.readAsText(file)
    } catch (error) {
      console.error('Error parsing subtitle file:', error)
      setProcessing(false)
    }
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result)
  }

  const handleDownload = () => {
    if (!result) return
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'extracted-text.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setFile(null)
    setResult('')
    setDetectedFormat(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('subtitles_to_text.title')}
        </h1>
        <p className="text-xl text-gray-600">
          {t('subtitles_to_text.description')}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        {/* 文件上传 */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            {t('subtitles_to_text.upload_label')}
          </label>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".srt,.vtt,.ass,.txt"
              onChange={handleFileChange}
              className="hidden"
              id="subtitle-file"
            />
            <div className="text-gray-600">
              {file ? (
                <div>
                  <svg className="mx-auto h-12 w-12 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  {detectedFormat && (
                    <p className="text-sm text-primary-600 mt-1">
                      {t('subtitles_to_text.detected')}: {detectedFormat.toUpperCase()}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p>{t('subtitles_to_text.upload_hint')}</p>
                  <p className="text-sm text-gray-500 mt-1">SRT, VTT, ASS</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 转换按钮 */}
        <button
          onClick={handleConvert}
          disabled={processing || !file}
          className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? t('subtitles_to_text.processing') : t('subtitles_to_text.convert')}
        </button>

        {/* 结果显示 */}
        {result && (
          <div className="space-y-4">
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-gray-700 font-semibold">
                  {t('subtitles_to_text.result_label')}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    {t('subtitles_to_text.copy')}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                  >
                    {t('subtitles_to_text.download')}
                  </button>
                </div>
              </div>
              <textarea
                value={result}
                readOnly
                className="w-full h-48 p-4 border border-gray-300 rounded-lg bg-gray-50"
                style={{ color: '#000000' }}
              />
            </div>

            {/* 重新开始 */}
            <button
              onClick={handleClear}
              className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              {t('subtitles_to_text.edit')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

