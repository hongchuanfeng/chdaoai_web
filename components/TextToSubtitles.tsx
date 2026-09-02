'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState } from 'react'

type SubtitleFormat = 'srt' | 'vtt' | 'ass' | 'txt'

interface SubtitleSegment {
  id: number
  startTime: string
  endTime: string
  text: string
}

export default function TextToSubtitles() {
  const { t } = useLanguage()
  const [text, setText] = useState('')
  const [processing, setProcessing] = useState(false)
  const [output, setOutput] = useState('')
  const [format, setFormat] = useState<SubtitleFormat>('srt')
  const [duration, setDuration] = useState(5) // 每段持续秒数
  const [previewSegments, setPreviewSegments] = useState<SubtitleSegment[]>([])

  // 将文本分割成段落
  const parseTextToSegments = (inputText: string): string[] => {
    // 按换行符分割，过滤空行
    return inputText
      .split(/\n+/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
  }

  // 格式化时间
  const formatTime = (seconds: number, format: SubtitleFormat): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (format === 'srt') {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},000`
    } else if (format === 'vtt') {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.000`
    } else if (format === 'ass') {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.00`
    }
    return ''
  }

  // 生成SRT格式
  const generateSRT = (segments: SubtitleSegment[]): string => {
    return segments.map(seg => 
      `${seg.id}\n${seg.startTime} --> ${seg.endTime}\n${seg.text}\n`
    ).join('\n')
  }

  // 生成VTT格式
  const generateVTT = (segments: SubtitleSegment[]): string => {
    const content = segments.map(seg => 
      `${seg.startTime} --> ${seg.endTime}\n${seg.text}\n`
    ).join('\n')
    return `WEBVTT\n\n${content}`
  }

  // 生成ASS格式
  const generateASS = (segments: SubtitleSegment[]): string => {
    const header = `[Script Info]
Title: Converted Subtitles
ScriptType: v4.00+
Collisions: Normal
PlayDepth: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`
    const events = segments.map(seg => 
      `Dialogue: 0,${seg.startTime},${seg.endTime},Default,,0,0,0,,${seg.text.replace(/\n/g, '\\N')}`
    ).join('\n')
    
    return header + events
  }

  // 生成TXT格式（纯文本）
  const generateTXT = (segments: SubtitleSegment[]): string => {
    return segments.map(seg => seg.text).join('\n\n')
  }

  const handleConvert = async () => {
    if (!text.trim()) return
    
    setProcessing(true)
    
    try {
      const lines = parseTextToSegments(text)
      const segments: SubtitleSegment[] = []
      let currentTime = 0

      lines.forEach((line, index) => {
        const startTime = formatTime(currentTime, format)
        const endTime = formatTime(currentTime + duration, format)
        
        segments.push({
          id: index + 1,
          startTime,
          endTime,
          text: line
        })
        
        currentTime += duration
      })

      setPreviewSegments(segments)

      let result = ''
      switch (format) {
        case 'srt':
          result = generateSRT(segments)
          break
        case 'vtt':
          result = generateVTT(segments)
          break
        case 'ass':
          result = generateASS(segments)
          break
        case 'txt':
          result = generateTXT(segments)
          break
      }
      
      setOutput(result)
    } catch (error) {
      console.error('Error converting text to subtitles:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!output) return
    
    const extensions: { [key: string]: string } = {
      srt: '.srt',
      vtt: '.vtt',
      ass: '.ass',
      txt: '.txt'
    }
    
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `subtitles${extensions[format]}`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
  }

  const handleClear = () => {
    setText('')
    setOutput('')
    setPreviewSegments([])
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('text_to_subtitles.title')}
        </h1>
        <p className="text-xl text-gray-600">
          {t('text_to_subtitles.description')}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        {/* 格式选择 */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            {t('text_to_subtitles.format')}
          </label>
          <div className="grid grid-cols-4 gap-3">
            {(['srt', 'vtt', 'ass', 'txt'] as SubtitleFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => { setFormat(fmt); setOutput(''); }}
                className={`py-2 px-4 rounded-lg font-medium transition ${
                  format === fmt
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {t('text_to_subtitles.format_desc')}
          </p>
        </div>

        {/* 每段持续时间 */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            {t('text_to_subtitles.duration')}: {duration}s
          </label>
          <input 
            type="range" 
            min="1" 
            max="30" 
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* 文字输入 */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            {t('text_to_subtitles.input_label')}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('text_to_subtitles.input_placeholder')}
            style={{ color: '#000000' }}
            className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* 转换按钮 */}
        <button
          onClick={handleConvert}
          disabled={processing || !text.trim()}
          className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? t('text_to_subtitles.processing') : t('text_to_subtitles.convert')}
        </button>

        {/* 输出结果 */}
        {output && (
          <div className="space-y-4">
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-gray-700 font-semibold">
                  {t('text_to_subtitles.output')}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    {t('text_to_subtitles.copy')}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                  >
                    {t('text_to_subtitles.download')}
                  </button>
                </div>
              </div>
              
              {/* 预览 */}
              {previewSegments.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">{t('text_to_subtitles.preview')}</p>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {previewSegments.slice(0, 5).map((seg) => (
                      <div key={seg.id} className="mb-2 pb-2 border-b border-gray-200 last:border-0">
                        <span className="text-xs text-gray-500">
                          {`${seg.startTime} --> ${seg.endTime}`}
                        </span>
                        <p className="text-gray-900">{seg.text}</p>
                      </div>
                    ))}
                    {previewSegments.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        ... {t('text_to_subtitles.and_more', { count: previewSegments.length - 5 })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <textarea
                value={output}
                readOnly
                className="w-full h-48 p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
              />
            </div>

            {/* 重新编辑 */}
            <button
              onClick={handleClear}
              className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              {t('text_to_subtitles.edit')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

