'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

type SubtitleFormat = 'srt' | 'vtt' | 'ass'

interface SubtitleEntry {
  index: number
  startTime: string
  endTime: string
  text: string[]
}

// 模拟翻译函数 - 实际项目中应该调用真实的翻译API
const mockTranslate = async (text: string, targetLang: string): Promise<string> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // 这里应该调用真实的翻译API
  // 为了演示，我们返回一个标记的翻译结果
  const translations: Record<string, Record<string, string>> = {
    en: { '你好': 'Hello', '世界': 'World', '测试': 'Test' },
    zh: { 'Hello': '你好', 'World': '世界', 'Test': '测试' },
    ja: { 'Hello': 'こんにちは', 'World': '世界', 'Test': 'テスト' },
    ko: { 'Hello': '안녕하세요', 'World': '세계', 'Test': '테스트' },
    fr: { 'Hello': 'Bonjour', 'World': 'Monde', 'Test': 'Test' },
    de: { 'Hello': 'Hallo', 'World': 'Welt', 'Test': 'Test' },
    es: { 'Hello': 'Hola', 'World': 'Mundo', 'Test': 'Prueba' },
    ru: { 'Hello': 'Привет', 'World': 'Мир', 'Test': 'Тест' },
    pt: { 'Hello': 'Olá', 'World': 'Mundo', 'Test': 'Teste' },
    ar: { 'Hello': 'مرحبا', 'World': 'عالم', 'Test': 'اختبار' }
  }
  
  // 返回原始文本 + 目标语言标记（实际应该调用真实API）
  return `[${targetLang}] ${text}`
}

export default function SubtitleTranslation() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [sourceFormat, setSourceFormat] = useState<SubtitleFormat | null>(null)
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [sourceLanguage, setSourceLanguage] = useState('auto')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [translatedContent, setTranslatedContent] = useState('')
  const [originalEntries, setOriginalEntries] = useState<SubtitleEntry[]>([])
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
    const lines = content.trim().split('\n')
    const entries: SubtitleEntry[] = []
    let currentIndex = 1
    let i = 0
    
    while (i < lines.length && !lines[i].includes('-->')) {
      i++
    }
    
    while (i < lines.length) {
      const times = lines[i].match(/(\d{2}:\d{2}:\d{2}[\.\:]\d{3}|\d{2}:\d{2}[\.\:]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[\.\:]\d{3}|\d{2}:\d{2}[\.\:]\d{3})/)
      if (times) {
        let startTime = times[1]
        let endTime = times[2]
        
        if (startTime.split(':').length === 2) startTime = '00:' + startTime
        if (endTime.split(':').length === 2) endTime = '00:' + endTime
        
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

  // 解析ASS
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

  // 检测格式
  const detectFormat = (content: string): SubtitleFormat | null => {
    const trimmed = content.trim()
    if (trimmed.startsWith('WEBVTT')) return 'vtt'
    if (trimmed.startsWith('[Script Info]') || trimmed.includes('[Events]')) return 'ass'
    if (/^\d+$/.test(trimmed.split('\n')[0])) return 'srt'
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setDownloadUrl('')
      setTranslatedContent('')
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const format = detectFormat(content)
        setSourceFormat(format)
      }
      reader.readAsText(selectedFile)
    }
  }

  const translateEntry = async (entry: SubtitleEntry): Promise<SubtitleEntry> => {
    const translatedText = await Promise.all(
      entry.text.map(line => mockTranslate(line, targetLanguage))
    )
    return {
      ...entry,
      text: translatedText
    }
  }

  const handleTranslate = async () => {
    if (!file) return
    setProcessing(true)
    setProgress(0)
    
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const content = event.target?.result as string
        const format = sourceFormat || detectFormat(content) || 'srt'
        
        let entries: SubtitleEntry[]
        switch (format) {
          case 'srt': entries = parseSRT(content); break
          case 'vtt': entries = parseVTT(content); break
          case 'ass': entries = parseASS(content); break
          default: entries = []
        }
        
        setOriginalEntries(entries)
        
        // 翻译每个字幕条目
        const translatedEntries: SubtitleEntry[] = []
        for (let i = 0; i < entries.length; i++) {
          const translated = await translateEntry(entries[i])
          translatedEntries.push(translated)
          setProgress(Math.round(((i + 1) / entries.length) * 100))
        }
        
        const translated = toSRT(translatedEntries)
        setTranslatedContent(translated)
        
        const blob = new Blob([translated], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)
        setProcessing(false)
      }
      reader.readAsText(file)
    } catch (error) {
      console.error('Error translating subtitle:', error)
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!downloadUrl || !file) return
    const ext = file.name.split('.').pop()
    const baseName = file.name.replace(/\.[^.]+$/, '')
    const langCode = targetLanguage
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `${baseName}_${langCode}.${ext || 'srt'}`
    link.click()
  }

  const handleCopy = () => {
    if (!translatedContent) return
    navigator.clipboard.writeText(translatedContent)
  }

  const handleClear = () => {
    setFile(null)
    setSourceFormat(null)
    setDownloadUrl('')
    setTranslatedContent('')
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const languageNames: Record<string, string> = {
    en: 'English',
    zh: '中文',
    ja: '日本語',
    ko: '한국어',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
    ru: 'Русский',
    pt: 'Português',
    ar: 'العربية'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('subtitle_translation.title')}
        </h1>
        <p className="text-xl text-gray-600">
          {t('subtitle_translation.description')}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        {/* 文件上传 */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            {t('subtitle_translation.upload_label')}
          </label>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".srt,.vtt,.ass,.ssa"
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
                      {t('subtitle_translation.detected')}: {sourceFormat.toUpperCase()}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p>{t('subtitle_translation.upload_hint')}</p>
                  <p className="text-sm text-gray-500 mt-1">SRT, VTT, ASS</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 目标语言选择 */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            {t('subtitle_translation.target_language')}
          </label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="es">Español</option>
            <option value="ru">Русский</option>
            <option value="pt">Português</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        {/* 进度条 */}
        {processing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('subtitle_translation.processing')}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* 翻译按钮 */}
        <button
          onClick={handleTranslate}
          disabled={processing || !file}
          className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? t('subtitle_translation.processing') : t('subtitle_translation.translate')}
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
                  {t('subtitle_translation.copy')}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  {t('subtitle_translation.download')}
                </button>
              </div>
            </div>

            {/* 重新开始 */}
            <button
              onClick={handleClear}
              className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              {t('subtitle_translation.edit')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

