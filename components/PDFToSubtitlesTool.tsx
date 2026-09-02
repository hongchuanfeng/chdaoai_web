'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

interface PDFToSubtitlesProps {
  toolKey: string
}

export default function PDFToSubtitles({ toolKey }: PDFToSubtitlesProps) {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [downloadFilename, setDownloadFilename] = useState('')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [subtitleFormat, setSubtitleFormat] = useState('srt')
  const [charsPerLine, setCharsPerLine] = useState(40)
  const [durationPerChar, setDurationPerChar] = useState(0.3)
  const [extractedText, setExtractedText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const selectedFile = files[0]
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError(t('pdf_to_subtitles.invalid_file') || 'Please select a PDF file')
      return
    }
    
    setFile(selectedFile)
    setError('')
    setDownloadUrl('')
    setExtractedText('')
    setProgress(0)
  }

  const clearFile = () => {
    setFile(null)
    setDownloadUrl('')
    setError('')
    setProgress(0)
    setExtractedText('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Extract text from PDF using pdf.js
  const extractTextFromPDF = async (file: File): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    let fullText = ''
    const numPages = pdf.numPages
    
    for (let i = 1; i <= numPages; i++) {
      setProgress(Math.floor(10 + (i / numPages) * 30))
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map((item: any) => item.str).join(' ')
      fullText += pageText + '\n\n'
    }
    
    return fullText.trim()
  }

  // Format time for SRT (HH:MM:SS,mmm)
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
  }

  // Format time for VTT (HH:MM:SS.mmm)
  const formatTimeVTT = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
  }

  // Format time for ASS (H:MM:SS.cc)
  const formatTimeASS = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const cs = Math.floor((seconds % 1) * 100)
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`
  }

  // Generate SRT subtitles
  const generateSRT = (text: string): string => {
    const lines: string[] = []
    const paragraphs = text.split(/\n{2,}/).filter(p => p.trim())
    let index = 1
    let startTime = 0

    for (const paragraph of paragraphs) {
      const words = paragraph.trim().split(/\s+/)
      let currentLine = ''
      let lineStartTime = startTime

      for (const word of words) {
        if ((currentLine + ' ' + word).trim().length <= charsPerLine) {
          currentLine = (currentLine + ' ' + word).trim()
        } else {
          if (currentLine) {
            const duration = currentLine.length * durationPerChar
            const endTime = lineStartTime + duration
            lines.push(`${index}`)
            lines.push(`${formatTime(lineStartTime)} --> ${formatTime(endTime)}`)
            lines.push(currentLine)
            lines.push('')
            index++
            startTime = endTime + 0.1
            lineStartTime = startTime
          }
          currentLine = word
        }
      }

      if (currentLine) {
        const duration = currentLine.length * durationPerChar
        const endTime = lineStartTime + duration
        lines.push(`${index}`)
        lines.push(`${formatTime(lineStartTime)} --> ${formatTime(endTime)}`)
        lines.push(currentLine)
        lines.push('')
        index++
        startTime = endTime + 0.5
      }
    }

    return lines.join('\n')
  }

  // Generate VTT subtitles
  const generateVTT = (text: string): string => {
    const lines: string[] = ['WEBVTT', '']
    const paragraphs = text.split(/\n{2,}/).filter(p => p.trim())
    let index = 1
    let startTime = 0

    for (const paragraph of paragraphs) {
      const words = paragraph.trim().split(/\s+/)
      let currentLine = ''
      let lineStartTime = startTime

      for (const word of words) {
        if ((currentLine + ' ' + word).trim().length <= charsPerLine) {
          currentLine = (currentLine + ' ' + word).trim()
        } else {
          if (currentLine) {
            const duration = currentLine.length * durationPerChar
            const endTime = lineStartTime + duration
            lines.push(`${index}`)
            lines.push(`${formatTimeVTT(lineStartTime)} --> ${formatTimeVTT(endTime)}`)
            lines.push(currentLine)
            lines.push('')
            index++
            startTime = endTime + 0.1
            lineStartTime = startTime
          }
          currentLine = word
        }
      }

      if (currentLine) {
        const duration = currentLine.length * durationPerChar
        const endTime = lineStartTime + duration
        lines.push(`${index}`)
        lines.push(`${formatTimeVTT(lineStartTime)} --> ${formatTimeVTT(endTime)}`)
        lines.push(currentLine)
        lines.push('')
        index++
        startTime = endTime + 0.5
      }
    }

    return lines.join('\n')
  }

  // Generate ASS subtitles
  const generateASS = (text: string): string => {
    const lines: string[] = [
      '[Script Info]',
      'Title: Generated Subtitles',
      'ScriptType: v4.00+',
      'PlayDepth: 0',
      '',
      '[V4+ Styles]',
      'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
      'Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1',
      '',
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text'
    ]
    const paragraphs = text.split(/\n{2,}/).filter(p => p.trim())
    let startTime = 0

    for (const paragraph of paragraphs) {
      const words = paragraph.trim().split(/\s+/)
      let currentLine = ''
      let lineStartTime = startTime

      for (const word of words) {
        if ((currentLine + ' ' + word).trim().length <= charsPerLine) {
          currentLine = (currentLine + ' ' + word).trim()
        } else {
          if (currentLine) {
            const duration = currentLine.length * durationPerChar
            const endTime = lineStartTime + duration
            lines.push(`Dialogue: 0,${formatTimeASS(lineStartTime)},${formatTimeASS(endTime)},Default,,0,0,0,,${currentLine}`)
            startTime = endTime + 0.1
            lineStartTime = startTime
          }
          currentLine = word
        }
      }

      if (currentLine) {
        const duration = currentLine.length * durationPerChar
        const endTime = lineStartTime + duration
        lines.push(`Dialogue: 0,${formatTimeASS(lineStartTime)},${formatTimeASS(endTime)},Default,,0,0,0,,${currentLine}`)
        startTime = endTime + 0.5
      }
    }

    return lines.join('\n')
  }

  const handleConvert = async () => {
    if (!file) return
    setProcessing(true)
    setError('')
    setProgress(0)
    setDownloadUrl('')

    try {
      // Extract text from PDF
      const text = await extractTextFromPDF(file)
      
      if (!text || text.trim().length === 0) {
        setError(t('pdf_to_subtitles.no_content') || 'No text content found in PDF')
        setProcessing(false)
        return
      }
      
      setExtractedText(text.substring(0, 500) + (text.length > 500 ? '...' : ''))
      setProgress(50)
      
      // Generate subtitles based on format
      let subtitleContent = ''
      switch (subtitleFormat) {
        case 'srt':
          subtitleContent = generateSRT(text)
          break
        case 'vtt':
          subtitleContent = generateVTT(text)
          break
        case 'ass':
          subtitleContent = generateASS(text)
          break
        default:
          subtitleContent = generateSRT(text)
      }
      
      setProgress(80)
      
      // Create download file
      const mimeType = subtitleFormat === 'vtt' ? 'text/vtt' : 'text/plain'
      const blob = new Blob([subtitleContent], { type: mimeType })
      const url = URL.createObjectURL(blob)
      
      setDownloadUrl(url)
      const baseName = file.name.replace('.pdf', '')
      setDownloadFilename(`${baseName}.${subtitleFormat}`)
      
      setProgress(100)
      setProcessing(false)
      
    } catch (err: any) {
      console.error('Conversion error:', err)
      setError(err.message || t('pdf_to_subtitles.failed') || 'Conversion failed')
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!downloadUrl) return
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = downloadFilename
    link.click()
  }

  const handleConvertAnother = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl)
    }
    setDownloadUrl('')
    setProgress(0)
    setExtractedText('')
    clearFile()
  }

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t(`nav.${toolKey.replace(/-/g, '_')}`)}
          </h1>
          <p className="text-xl text-gray-600">
            {t(`${toolKey.replace(/-/g, '_')}.description`)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {!downloadUrl ? (
            <>
              <label className="block">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition cursor-pointer">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-lg text-gray-700 mb-2">
                    {file 
                      ? file.name 
                      : t(`${toolKey.replace(/-/g, '_')}.upload`)
                    }
                  </p>
                  {file && (
                    <p className="text-sm text-gray-500">
                      ({formatFileSize(file.size)})
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {t(`${toolKey.replace(/-/g, '_')}.supported`)}
                  </p>
                </div>
              </label>

              {file && (
                <div className="mt-6 space-y-4">
                  {/* Subtitle Options */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">
                      {t('pdf_to_subtitles.subtitle_options') || 'Subtitle Options'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('pdf_to_subtitles.subtitle_format') || 'Subtitle Format'}
                        </label>
                        <select
                          value={subtitleFormat}
                          onChange={(e) => setSubtitleFormat(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                        >
                          <option value="srt">SRT (SubRip)</option>
                          <option value="vtt">VTT (WebVTT)</option>
                          <option value="ass">ASS (Advanced SubStation)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('pdf_to_subtitles.chars_per_line') || 'Characters per line'}: {charsPerLine}
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="60"
                          step="5"
                          value={charsPerLine}
                          onChange={(e) => setCharsPerLine(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>20</span>
                          <span>40</span>
                          <span>60</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('pdf_to_subtitles.duration_per_char') || 'Duration per character'}: {durationPerChar.toFixed(2)}s
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="0.5"
                        step="0.05"
                        value={durationPerChar}
                        onChange={(e) => setDurationPerChar(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.1s</span>
                        <span>0.3s</span>
                        <span>0.5s</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleConvert}
                    disabled={processing}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t(`${toolKey.replace(/-/g, '_')}.processing`)} {progress}%
                      </>
                    ) : (
                      t(`${toolKey.replace(/-/g, '_')}.convert`)
                    )}
                  </button>
                  
                  <button
                    onClick={clearFile}
                    className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
                  >
                    {t('common.clear')}
                  </button>
                </div>
              )}

              {extractedText && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    {t('pdf_to_subtitles.extracted_text') || 'Extracted Text'}
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {extractedText}
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mt-4">
                  {error}
                </div>
              )}

              {processing && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('pdf_to_subtitles.success_title') || 'Conversion Complete'}
                </h3>
                <p className="text-gray-600">
                  {t('pdf_to_subtitles.success_desc') || 'Subtitle file has been generated'}
                </p>
              </div>

              {extractedText && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-medium text-gray-700 mb-2">
                    {t('pdf_to_subtitles.extracted_text') || 'Extracted Text'}
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {extractedText}
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={handleDownload}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('pdf_to_subtitles.download') || 'Download Subtitles'}
                </button>
                
                <button
                  onClick={handleConvertAnother}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  {t('pdf_to_subtitles.convert_another') || 'Convert Another'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
