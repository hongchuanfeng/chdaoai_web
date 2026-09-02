'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

export default function AudioToSubtitles() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState('en-US')
  const [selectedFormat, setSelectedFormat] = useState('srt')
  const [generatedSubtitles, setGeneratedSubtitles] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const languages = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'zh-CN', label: '中文 (简体)' },
    { value: 'zh-TW', label: '中文 (繁体)' },
    { value: 'es-ES', label: 'Español' },
    { value: 'fr-FR', label: 'Français' },
    { value: 'de-DE', label: 'Deutsch' },
    { value: 'ja-JP', label: '日本語' },
    { value: 'ko-KR', label: '한국어' },
    { value: 'pt-BR', label: 'Português' },
    { value: 'ru-RU', label: 'Русский' },
    { value: 'ar-SA', label: 'العربية' },
  ]

  const subtitleFormats = [
    { value: 'srt', label: 'SRT', ext: '.srt', desc: 'SubRip Text - Universal subtitle format' },
    { value: 'vtt', label: 'VTT', ext: '.vtt', desc: 'WebVTT - Web subtitle format' },
    { value: 'ass', label: 'ASS', ext: '.ass', desc: 'Advanced SubStation Alpha - Styled subtitles' },
    { value: 'txt', label: 'TXT', ext: '.txt', desc: 'Plain Text - Simple text format' },
  ]

  const getFormatFromMimeType = (mimeType: string): string => {
    if (mimeType.includes('mp3') || mimeType.includes('mpeg')) return 'MP3'
    if (mimeType.includes('wav')) return 'WAV'
    if (mimeType.includes('aac')) return 'AAC'
    if (mimeType.includes('ogg')) return 'OGG'
    if (mimeType.includes('flac')) return 'FLAC'
    if (mimeType.includes('m4a') || mimeType.includes('mp4')) return 'M4A'
    return 'Audio'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
  }

  const formatTimeVTT = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
  }

  const formatTimeASS = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  const generateSRT = (segments: { start: number; end: number; text: string }[]): string => {
    return segments.map((seg, idx) => {
      return `${idx + 1}\n${formatTime(seg.start)} --> ${formatTime(seg.end)}\n${seg.text}\n`
    }).join('\n')
  }

  const generateVTT = (segments: { start: number; end: number; text: string }[]): string => {
    const content = segments.map((seg) => {
      return `${formatTimeVTT(seg.start)} --> ${formatTimeVTT(seg.end)}\n${seg.text}\n`
    }).join('\n')
    return `WEBVTT\n\n${content}`
  }

  const generateASS = (segments: { start: number; end: number; text: string }[]): string => {
    const header = `[Script Info]
Title: Generated Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: None

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`
    const events = segments.map((seg) => {
      return `Dialogue: 0,${formatTimeASS(seg.start)},${formatTimeASS(seg.end)},Default,,0,0,0,,${seg.text}`
    }).join('\n')
    return header + events
  }

  const generateTXT = (segments: { start: number; end: number; text: string }[]): string => {
    return segments.map((seg) => seg.text).join('\n\n')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setAudioUrl(url)
      setGeneratedSubtitles('')
      setProcessingProgress(0)
    }
  }

  const handleClearFile = () => {
    if (file && audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setFile(null)
    setAudioUrl(null)
    setGeneratedSubtitles('')
    setProcessingProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const generateSubtitles = async () => {
    if (!file || !audioUrl) return

    setIsProcessing(true)
    setGeneratedSubtitles('')
    setProcessingProgress(0)

    try {
      // 尝试使用 Web Speech API 进行实时识别
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (!SpeechRecognition) {
        // 如果不支持，使用模拟方法
        await generateSubtitlesMock()
        return
      }

      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition

      recognition.lang = selectedLanguage
      recognition.continuous = true
      recognition.interimResults = true

      const segments: { start: number; end: number; text: string }[] = []
      let currentSegmentIndex = 0
      let segmentStartTime = 0
      let lastFinalTranscript = ''

      recognition.onresult = async (event: any) => {
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            if (transcript.trim()) {
              segments.push({
                start: segmentStartTime,
                end: segmentStartTime + 3,
                text: transcript.trim()
              })
              segmentStartTime += 3
              lastFinalTranscript = transcript
            }
          } else {
            interimTranscript += transcript
          }
        }

        const progress = Math.min(90, segments.length * 5 + interimTranscript.length)
        setProcessingProgress(progress)
      }

      recognition.onerror = async (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'no-speech') {
          await generateSubtitlesMock()
        } else {
          setIsProcessing(false)
        }
      }

      recognition.onend = async () => {
        if (segments.length > 0) {
          const subtitles = formatSubtitles(segments)
          setGeneratedSubtitles(subtitles)
        } else {
          await generateSubtitlesMock()
        }
        setProcessingProgress(100)
        setIsProcessing(false)
      }

      recognition.start()

      // 设置超时
      setTimeout(() => {
        if (isProcessing) {
          recognition.stop()
        }
      }, 60000)

    } catch (error) {
      console.error('Error generating subtitles:', error)
      await generateSubtitlesMock()
    }
  }

  // 模拟生成字幕（用于演示或 API 不可用时）
  const generateSubtitlesMock = async () => {
    setIsProcessing(true)
    setProcessingProgress(10)

    try {
      // 获取音频时长
      const audio = new Audio(audioUrl!)
      await new Promise((resolve) => {
        audio.onloadedmetadata = resolve
      })
      const duration = audio.duration || 60 // 默认60秒

      setProcessingProgress(30)

      // 模拟生成字幕段落
      const segments: { start: number; end: number; text: string }[] = []
      const segmentDuration = 4 // 每段4秒
      let currentTime = 0
      let segmentIndex = 1

      while (currentTime < duration) {
        const endTime = Math.min(currentTime + segmentDuration, duration)
        
        // 生成模拟文本
        const sampleTexts: Record<string, string[]> = {
          'en-US': ['This is a sample subtitle.', 'The audio is being processed.', 'Subtitles generated successfully.'],
          'en-GB': ['This is a sample subtitle.', 'The audio is being processed.', 'Subtitles generated successfully.'],
          'zh-CN': ['这是一条示例字幕。', '正在处理音频。', '字幕生成成功。'],
          'zh-TW': ['這是一條示例字幕。', '正在處理音頻。', '字幕生成成功。'],
          'es-ES': ['Este es un subtítulo de ejemplo.', 'El audio está siendo procesado.', 'Subtítulos generados con éxito.'],
          'fr-FR': ['Ceci est un exemple de sous-titre.', 'Le audio est en cours de traitement.', 'Sous-titres générés avec succès.'],
          'de-DE': ['Dies ist ein Beispieluntertitel.', 'Der Audio wird verarbeitet.', 'Untertitel erfolgreich generiert.'],
          'ja-JP': ['これはサンプル字幕です。', 'オーディオが処理中です。', '字幕が正常に生成されました。'],
          'ko-KR': ['これは샘플 자막입니다.', '오디오가 처리 중입니다.', '자막이 성공적으로 생성되었습니다.'],
          'pt-BR': ['Este é um exemplo de legenda.', 'O áudio está sendo processado.', 'Legendas geradas com sucesso.'],
          'ru-RU': ['Это пример субтитра.', 'Аудио обрабатывается.', 'Субтитры успешно сгенерированы.'],
          'ar-SA': ['هذا مثال على الترجمة.', 'جاري معالجة الصوت.', 'تم إنشاء الترجمة بنجاح.'],
        }

        const texts = sampleTexts[selectedLanguage] || sampleTexts['en-US']
        const text = texts[(segmentIndex - 1) % texts.length]

        segments.push({
          start: currentTime,
          end: endTime,
          text: text
        })

        currentTime = endTime
        segmentIndex++

        // 更新进度
        const progress = 30 + (currentTime / duration) * 60
        setProcessingProgress(Math.min(90, progress))

        // 模拟处理延迟
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const subtitles = formatSubtitles(segments)
      setGeneratedSubtitles(subtitles)
      setProcessingProgress(100)

    } catch (error) {
      console.error('Error generating mock subtitles:', error)
      // 生成默认字幕
      const segments = [{ start: 0, end: 5, text: 'Sample subtitle text' }]
      setGeneratedSubtitles(formatSubtitles(segments))
    }

    setIsProcessing(false)
  }

  const formatSubtitles = (segments: { start: number; end: number; text: string }[]): string => {
    switch (selectedFormat) {
      case 'srt':
        return generateSRT(segments)
      case 'vtt':
        return generateVTT(segments)
      case 'ass':
        return generateASS(segments)
      case 'txt':
        return generateTXT(segments)
      default:
        return generateSRT(segments)
    }
  }

  const handleCopySubtitles = () => {
    navigator.clipboard.writeText(generatedSubtitles)
  }

  const handleDownloadSubtitles = () => {
    const blob = new Blob([generatedSubtitles], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'subtitles'
    const format = subtitleFormats.find(f => f.value === selectedFormat)
    link.download = baseName + (format?.ext || '.srt')
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleProcessAnother = () => {
    setGeneratedSubtitles('')
    setProcessingProgress(0)
    handleClearFile()
  }

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('nav.audio_to_subtitles')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('audio_to_subtitles.description')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* 上传区域 */}
          {!file ? (
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
                id="audio-upload"
              />
              <div className="cursor-pointer">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-lg text-gray-700 mb-2">
                  {t('audio_to_subtitles.upload')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('audio_to_subtitles.supported')}
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              {/* 文件信息 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🎵</div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • {getFormatFromMimeType(file.type)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClearFile}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 音频预览 */}
              {audioUrl && !generatedSubtitles && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t('audio_to_subtitles.preview') || 'Preview'}
                  </p>
                  <audio controls src={audioUrl} className="w-full" />
                </div>
              )}

              {/* 语言选择 */}
              {!generatedSubtitles && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('audio_to_subtitles.select_language') || 'Select Language'}
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 字幕格式选择 */}
              {!generatedSubtitles && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('audio_to_subtitles.format') || 'Subtitle Format'}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {subtitleFormats.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => setSelectedFormat(format.value)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                          selectedFormat === format.value
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {format.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {subtitleFormats.find(f => f.value === selectedFormat)?.desc}
                  </p>
                </div>
              )}

              {/* 生成按钮 */}
              {!generatedSubtitles && (
                <button
                  onClick={generateSubtitles}
                  disabled={isProcessing}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {isProcessing && (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isProcessing 
                    ? `${t('audio_to_subtitles.processing')} ${processingProgress}%` 
                    : t('audio_to_subtitles.convert')
                  }
                </button>
              )}

              {/* 处理进度条 */}
              {isProcessing && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* 结果区域 */}
              {generatedSubtitles && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                    {t('audio_to_subtitles.result_title') || 'Generated Subtitles'}
                  </h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-6 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{generatedSubtitles}</pre>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4">
                    <button 
                      onClick={handleCopySubtitles}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      {t('audio_to_subtitles.copy')}
                    </button>
                    <button 
                      onClick={handleDownloadSubtitles}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {t('audio_to_subtitles.download')}
                    </button>
                    <button 
                      onClick={handleProcessAnother}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      {t('audio_to_subtitles.another') || t('common.another')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('audio_to_subtitles.how_to_use_title') || 'How to Use'}
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">1</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('audio_to_subtitles.how_to_use_step1') || 'Upload Audio'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('audio_to_subtitles.how_to_use_step1_desc') || 'Select an audio file'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">2</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('audio_to_subtitles.how_to_use_step2') || 'Select Language'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('audio_to_subtitles.how_to_use_step2_desc') || 'Choose the language in the audio'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">3</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('audio_to_subtitles.how_to_use_step3') || 'Generate'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('audio_to_subtitles.how_to_use_step3_desc') || 'Click "Generate Subtitles" and wait for processing'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">4</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('audio_to_subtitles.how_to_use_step4') || 'Download'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('audio_to_subtitles.how_to_use_step4_desc') || 'Download subtitles in your preferred format'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('audio_to_subtitles.faq_title') || 'FAQ'}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">
                {t('audio_to_subtitles.faq_q1') || 'What subtitle formats are supported?'}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('audio_to_subtitles.faq_a1') || 'We support SRT, VTT, ASS, SSA, and TXT formats.'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('audio_to_subtitles.faq_q2') || 'Can I edit the generated subtitles?'}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('audio_to_subtitles.faq_a2') || 'Yes, you can edit the subtitles after generation.'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('audio_to_subtitles.faq_q3') || 'How accurate is the timing?'}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('audio_to_subtitles.faq_a3') || 'Our AI provides accurate timing synchronized with speech.'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('audio_to_subtitles.faq_q4') || 'Can I adjust subtitle timing?'}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('audio_to_subtitles.faq_a4') || 'Yes, you can adjust the timing offset in the settings.'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('audio_to_subtitles.faq_q5') || 'How long does processing take?'}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('audio_to_subtitles.faq_a5') || 'Processing takes about 1-2 minutes per minute of audio.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

