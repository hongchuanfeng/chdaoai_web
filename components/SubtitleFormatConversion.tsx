'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

type SubtitleFormat = 'srt' | 'vtt' | 'ass' | 'ssa' | 'txt'

interface SubtitleEntry {
  index: number
  startTime: string
  endTime: string
  text: string[]
}

export default function SubtitleFormatConversion() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [sourceFormat, setSourceFormat] = useState<SubtitleFormat | null>(null)
  const [targetFormat, setTargetFormat] = useState<SubtitleFormat>('srt')
  const [processing, setProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [convertedContent, setConvertedContent] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 解析SRT
  const parseSRT = (content: string): SubtitleEntry[] => {
    const blocks = content.trim().split(/\n\n+/)
    const entries: SubtitleEntry[] = []
    
    for (const block of blocks) {
      const lines = block.split('\n')
      if (lines.length >= 3) {
        const index = parseInt(lines[0])
        const times = lines[1].match(/(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/)
        if (times) {
          entries.push({
            index,
            startTime: times[1],
            endTime: times[2],
            text: lines.slice(2)
          })
        }
      }
    }
    return entries
  }

  // 解析VTT
  const parseVTT = (content: string): SubtitleEntry[] => {
    const lines = content.trim().split(/\n/)
    const entries: SubtitleEntry[] = []
    let currentIndex = 1
    let i = 0
    
    // 跳过WEBVTT头
    while (i < lines.length && !lines[i].includes('-->')) {
      i++
    }
    
    while (i < lines.length) {
      const times = lines[i].match(/(\d{2}:\d{2}:\d{2}[\.\:]\d{3}|\d{2}:\d{2}[\.\:]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[\.\:]\d{3}|\d{2}:\d{2}[\.\:]\d{3})/)
      if (times) {
        let startTime = times[1]
        let endTime = times[2]
        
        // 补全缺少的小时
        if (startTime.split(':').length === 2) {
          startTime = '00:' + startTime
        }
        if (endTime.split(':').length === 2) {
          endTime = '00:' + endTime
        }
        
        i++
        const text: string[] = []
        while (i < lines.length && lines[i].trim() !== '') {
          text.push(lines[i].trim())
          i++
        }
        entries.push({ index: currentIndex++, startTime, endTime, text })
      }
      i++
    }
    return entries
  }

  // 解析ASS/SSA
  const parseASS = (content: string): SubtitleEntry[] => {
    const lines = content.trim().split('\n')
    const entries: SubtitleEntry[] = []
    let inEvents = false
    let currentIndex = 1
    
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
        const parts = line.substring(9).split(',')
        if (parts.length >= 10) {
          const startTime = parts[1].trim()
          const endTime = parts[2].trim()
          const text = parts.slice(9).join(',')
          entries.push({
            index: currentIndex++,
            startTime,
            endTime,
            text: [text]
          })
        }
      }
    }
    return entries
  }

  // 转换为SRT
  const toSRT = (entries: SubtitleEntry[]): string => {
    return entries.map((entry, idx) => {
      const startTime = entry.startTime.replace(/\./g, ',')
      const endTime = entry.endTime.replace(/\./g, ',')
      return `${idx + 1}\n${startTime} --> ${endTime}\n${entry.text.join('\n')}`
    }).join('\n\n')
  }

  // 转换为VTT
  const toVTT = (entries: SubtitleEntry[]): string => {
    const content = entries.map(entry => {
      const startTime = entry.startTime.includes('.') ? entry.startTime : entry.startTime.replace(/,/g, '.')
      const endTime = entry.endTime.includes('.') ? entry.endTime : entry.endTime.replace(/,/g, '.')
      return `${startTime} --> ${endTime}\n${entry.text.join('\n')}`
    }).join('\n\n')
    return `WEBVTT\n\n${content}`
  }

  // 转换为ASS
  const toASS = (entries: SubtitleEntry[]): string => {
    const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 384
PlayResY: 288

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,16,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,1,1,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`
    
    const events = entries.map(entry => {
      const startTime = entry.startTime
      const endTime = entry.endTime
      const text = entry.text.join('\\N')
      return `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${text}`
    }).join('\n')
    
    return `${header}\n${events}`
  }

  // 转换为TXT
  const toTXT = (entries: SubtitleEntry[]): string => {
    return entries.map(entry => entry.text.join(' ')).join('\n\n')
  }

  // 检测格式
  const detectFormat = (content: string): SubtitleFormat | null => {
    const trimmed = content.trim()
    if (trimmed.startsWith('WEBVTT')) return 'vtt'
    if (trimmed.startsWith('[Script Info]') || trimmed.includes('[Events]')) return 'ass'
    if (/^\d+$/.test(trimmed.split('\n')[0])) return 'srt'
    return null
  }

  // 解析字幕
  const parseSubtitle = (content: string, format: SubtitleFormat): SubtitleEntry[] => {
    switch (format) {
      case 'srt': return parseSRT(content)
      case 'vtt': return parseVTT(content)
      case 'ass': return parseASS(content)
      case 'ssa': return parseASS(content)
      default: return []
    }
  }

  // 转换格式
  const convertFormat = (entries: SubtitleEntry[], format: SubtitleFormat): string => {
    switch (format) {
      case 'srt': return toSRT(entries)
      case 'vtt': return toVTT(entries)
      case 'ass': return toASS(entries)
      case 'ssa': return toASS(entries)
      case 'txt': return toTXT(entries)
      default: return ''
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setDownloadUrl('')
      setConvertedContent('')
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const format = detectFormat(content)
        setSourceFormat(format)
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
        const format = sourceFormat || detectFormat(content) || 'srt'
        const entries = parseSubtitle(content, format)
        const converted = convertFormat(entries, targetFormat)
        
        setConvertedContent(converted)
        
        const blob = new Blob([converted], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)
        setProcessing(false)
      }
      reader.readAsText(file)
    } catch (error) {
      console.error('Error converting subtitle:', error)
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!downloadUrl || !file) return
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = file.name.replace(/\.[^.]+$/, `.${targetFormat}`)
    link.click()
  }

  const handleCopy = () => {
    if (!convertedContent) return
    navigator.clipboard.writeText(convertedContent)
  }

  const handleClear = () => {
    setFile(null)
    setSourceFormat(null)
    setDownloadUrl('')
    setConvertedContent('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFormatLabel = (format: SubtitleFormat): string => {
    const labels: Record<SubtitleFormat, string> = {
      srt: 'SRT (SubRip)',
      vtt: 'VTT (WebVTT)',
      ass: 'ASS (Advanced SubStation Alpha)',
      ssa: 'SSA (SubStation Alpha)',
      txt: 'TXT (Plain Text)'
    }
    return labels[format]
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('subtitle_format_conversion.title')}
        </h1>
        <p className="text-xl text-gray-600">
          {t('subtitle_format_conversion.description')}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        {/* 文件上传 */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            {t('subtitle_format_conversion.upload_label')}
          </label>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".srt,.vtt,.ass,.ssa,.txt"
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
                  {sourceFormat && (
                    <p className="text-sm text-primary-600 mt-1">
                      {t('subtitle_format_conversion.detected')}: {getFormatLabel(sourceFormat)}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p>{t('subtitle_format_conversion.upload_hint')}</p>
                  <p className="text-sm text-gray-500 mt-1">SRT, VTT, ASS, SSA</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 目标格式选择 */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            {t('subtitle_format_conversion.target_format')}
          </label>
          <select
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value as SubtitleFormat)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="srt">SRT (SubRip)</option>
            <option value="vtt">VTT (WebVTT)</option>
            <option value="ass">ASS (Advanced SubStation Alpha)</option>
            <option value="ssa">SSA (SubStation Alpha)</option>
            <option value="txt">TXT (Plain Text)</option>
          </select>
        </div>

        {/* 转换按钮 */}
        <button
          onClick={handleConvert}
          disabled={processing || !file}
          className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? t('subtitle_format_conversion.processing') : t('subtitle_format_conversion.convert')}
        </button>

        {/* 下载和复制按钮 */}
        {downloadUrl && (
          <div className="space-y-4">
            <div className="border-t border-gray-200 pt-6">
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCopy}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                >
                  {t('subtitle_format_conversion.copy')}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  {t('subtitle_format_conversion.download')}
                </button>
              </div>
            </div>

            {/* 重新开始 */}
            <button
              onClick={handleClear}
              className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              {t('subtitle_format_conversion.edit')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

