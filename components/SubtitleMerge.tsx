'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

type SubtitleFormat = 'srt' | 'vtt' | 'ass' | 'ssa'

interface SubtitleEntry {
  index: number
  startTime: string
  endTime: string
  text: string[]
}

interface ParsedFile {
  name: string
  format: SubtitleFormat
  entries: SubtitleEntry[]
}

export default function SubtitleMerge() {
  const { t } = useLanguage()
  const [files, setFiles] = useState<File[]>([])
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([])
  const [processing, setProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [mergedContent, setMergedContent] = useState('')
  const [outputFormat, setOutputFormat] = useState<SubtitleFormat>('srt')
  const [adjustTiming, setAdjustTiming] = useState(true)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [error, setError] = useState('')
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

  // 检测格式
  const detectFormat = (content: string): SubtitleFormat | null => {
    const trimmed = content.trim()
    if (trimmed.startsWith('WEBVTT')) return 'vtt'
    if (trimmed.startsWith('[Script Info]') || trimmed.includes('[Events]')) return 'ass'
    if (/^\d+$/.test(trimmed.split('\n')[0])) return 'srt'
    return null
  }

  // 解析字幕文件
  const parseSubtitle = (content: string, format: SubtitleFormat): SubtitleEntry[] => {
    switch (format) {
      case 'srt': return parseSRT(content)
      case 'vtt': return parseVTT(content)
      case 'ass': 
      case 'ssa': return parseASS(content)
      default: return []
    }
  }

  // 时间转换为毫秒
  const timeToMs = (time: string): number => {
    // 支持格式: HH:MM:SS,mmm 或 HH:MM:SS.mmm
    const normalized = time.replace(',', '.')
    const parts = normalized.split(':')
    if (parts.length === 3) {
      const hours = parseInt(parts[0])
      const minutes = parseInt(parts[1])
      const secondsParts = parts[2].split('.')
      const seconds = parseInt(secondsParts[0])
      const ms = parseInt(secondsParts[1]?.padEnd(3, '0') || '0')
      return hours * 3600000 + minutes * 60000 + seconds * 1000 + ms
    }
    return 0
  }

  // 毫秒转换为时间
  const msToTime = (ms: number, format: SubtitleFormat): string => {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const milliseconds = ms % 1000
    
    const sep = format === 'srt' ? ',' : '.'
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}${sep}${milliseconds.toString().padStart(3, '0')}`
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const allFiles = [...files, ...newFiles]
      setFiles(allFiles)
      setError('')
      setDownloadUrl('')
      setMergedContent('')
      
      // 解析所有文件
      const promises = newFiles.map(file => {
        return new Promise<ParsedFile>((resolve) => {
          const reader = new FileReader()
          reader.onload = (event) => {
            const content = event.target?.result as string
            const format = detectFormat(content) || 'srt'
            const entries = parseSubtitle(content, format)
            resolve({ name: file.name, format, entries })
          }
          reader.readAsText(file)
        })
      })
      
      Promise.all(promises).then(parsed => {
        setParsedFiles(parsed)
        
        // 检查格式是否一致
        const formats = parsed.map(p => p.format)
        const uniqueFormats = [...new Set(formats)]
        if (uniqueFormats.length > 1) {
          setError(t('subtitle_merge.format_mismatch_hint'))
        }
      })
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    setFiles(newFiles)
    
    const newParsedFiles = [...parsedFiles]
    newParsedFiles.splice(index, 1)
    setParsedFiles(newParsedFiles)
    
    if (newParsedFiles.length > 0) {
      const formats = newParsedFiles.map(p => p.format)
      const uniqueFormats = [...new Set(formats)]
      if (uniqueFormats.length > 1) {
        setError(t('subtitle_merge.format_mismatch_hint'))
      } else {
        setError('')
      }
    } else {
      setError('')
    }
    setDownloadUrl('')
    setMergedContent('')
  }

  const clearAll = () => {
    setFiles([])
    setParsedFiles([])
    setDownloadUrl('')
    setMergedContent('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 拖拽排序
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    
    const newFiles = [...files]
    const newParsedFiles = [...parsedFiles]
    
    const draggedFile = newFiles[draggedIndex]
    const draggedParsed = newParsedFiles[draggedIndex]
    
    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedFile)
    
    newParsedFiles.splice(draggedIndex, 1)
    newParsedFiles.splice(index, 0, draggedParsed)
    
    setFiles(newFiles)
    setParsedFiles(newParsedFiles)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleMerge = async () => {
    if (parsedFiles.length < 2) return
    setProcessing(true)
    setError('')
    
    try {
      let offset = 0
      const mergedEntries: SubtitleEntry[] = []
      
      for (let i = 0; i < parsedFiles.length; i++) {
        const parsed = parsedFiles[i]
        const entries = parsed.entries.map(entry => {
          if (adjustTiming && i > 0) {
            return {
              ...entry,
              startTime: msToTime(timeToMs(entry.startTime) + offset, outputFormat),
              endTime: msToTime(timeToMs(entry.endTime) + offset, outputFormat)
            }
          }
          return entry
        })
        
        mergedEntries.push(...entries)
        
        // 计算下一个文件的偏移量
        if (adjustTiming && entries.length > 0) {
          const lastEntry = entries[entries.length - 1]
          offset = timeToMs(lastEntry.endTime)
        }
      }
      
      // 转换格式
      let result: string
      switch (outputFormat) {
        case 'srt':
          result = toSRT(mergedEntries)
          break
        case 'vtt':
          result = toVTT(mergedEntries)
          break
        case 'ass':
        case 'ssa':
          result = toASS(mergedEntries)
          break
        default:
          result = toSRT(mergedEntries)
      }
      
      setMergedContent(result)
      
      const blob = new Blob([result], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
    } catch (err) {
      console.error('Merge error:', err)
      setError('Merge failed')
    }
    
    setProcessing(false)
  }

  const handleDownload = () => {
    if (!downloadUrl) return
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `merged_subtitles.${outputFormat}`
    link.click()
  }

  const handleCopy = () => {
    if (!mergedContent) return
    navigator.clipboard.writeText(mergedContent)
  }

  const getFormatLabel = (format: SubtitleFormat): string => {
    const labels: Record<SubtitleFormat, string> = {
      srt: 'SRT',
      vtt: 'VTT',
      ass: 'ASS',
      ssa: 'SSA'
    }
    return labels[format]
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('subtitle_merge.title')}
        </h1>
        <p className="text-xl text-gray-600">
          {t('subtitle_merge.description')}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        {/* 文件上传 */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            {t('subtitle_merge.upload_label')}
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition">
            <input
              ref={fileInputRef}
              type="file"
              accept=".srt,.vtt,.ass,.ssa"
              onChange={handleFileChange}
              className="hidden"
              id="subtitle-files"
              multiple
            />
            <label htmlFor="subtitle-files" className="cursor-pointer">
              <div className="text-gray-600">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p>{t('subtitle_merge.upload_hint')}</p>
                <p className="text-sm text-gray-500 mt-1">SRT, VTT, ASS, SSA</p>
              </div>
            </label>
          </div>
        </div>

        {/* 文件列表 */}
        {files.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 font-semibold">
                {t('subtitle_merge.selected_files')}
              </label>
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-700"
              >
                {t('subtitle_merge.clear_all')}
              </button>
            </div>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between bg-gray-50 p-3 rounded-lg cursor-move ${draggedIndex === index ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                    <div>
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                        {parsedFiles[index] && (
                          <span className="ml-2 text-primary-600">
                            {getFormatLabel(parsedFiles[index].format)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">{t('subtitle_merge.reorder_hint')}</p>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* 选项 */}
        {files.length >= 2 && !error && (
          <div className="space-y-4">
            {/* 输出格式 */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                {t('subtitle_merge.output_format')}
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as SubtitleFormat)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="srt">SRT (SubRip)</option>
                <option value="vtt">VTT (WebVTT)</option>
                <option value="ass">ASS (Advanced SubStation Alpha)</option>
                <option value="ssa">SSA (SubStation Alpha)</option>
              </select>
            </div>

            {/* 时间调整 */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="adjust-timing"
                checked={adjustTiming}
                onChange={(e) => setAdjustTiming(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="adjust-timing" className="text-gray-700">
                <span className="font-semibold">{t('subtitle_merge.adjust_timing')}</span>
                <span className="text-gray-500 text-sm ml-2">({t('subtitle_merge.adjust_timing_hint')})</span>
              </label>
            </div>
          </div>
        )}

        {/* 合并按钮 */}
        <button
          onClick={handleMerge}
          disabled={processing || files.length < 2 || !!error}
          className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? t('subtitle_merge.processing') : t('subtitle_merge.merge')}
        </button>

        {files.length < 2 && files.length > 0 && (
          <p className="text-center text-gray-500 text-sm">
            {t('subtitle_merge.min_files')}
          </p>
        )}

        {/* 下载和复制按钮 */}
        {downloadUrl && (
          <div className="space-y-4">
            <div className="border-t border-gray-200 pt-6">
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCopy}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                >
                  {t('subtitle_merge.copy')}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  {t('subtitle_merge.download')}
                </button>
              </div>
            </div>

            {/* 重新开始 */}
            <button
              onClick={clearAll}
              className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              {t('subtitle_merge.edit')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}