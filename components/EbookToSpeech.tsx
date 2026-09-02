'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef, useEffect } from 'react'

export default function EbookToSpeech() {
  const { t, language } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed] = useState(1.0)
  const [extractedText, setExtractedText] = useState('')
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      setAvailableVoices(voices)
      // Set default voice based on language
      const langPrefix = language === 'zh' ? 'zh' : language === 'ja' ? 'ja' : language === 'ko' ? 'ko' : 'en'
      const defaultVoice = voices.find(v => v.lang.startsWith(langPrefix)) || voices[0]
      if (defaultVoice) {
        setSelectedVoice(defaultVoice.name)
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [language])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
      setDownloadUrl('')
      setExtractedText('')
    }
  }

  const clearFile = () => {
    setFile(null)
    setDownloadUrl('')
    setError('')
    setProgress(0)
    setExtractedText('')
    setAudioBlob(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getAcceptedFormats = () => {
    return '.epub,.txt,.md'
  }

  const extractTextFromEpub = async (file: File): Promise<string> => {
    const JSZip = (await import('jszip')).default
    const arrayBuffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(arrayBuffer)
    
    let fullText = ''
    const files = zip.files
    
    // Get all xhtml/html files
    const xhtmlFiles = Object.keys(files).filter(name => 
      (name.endsWith('.xhtml') || name.endsWith('.html') || name.endsWith('.htm')) &&
      !name.includes('nav') && !name.includes('toc')
    ).sort()
    
    for (const fileName of xhtmlFiles) {
      const content = await zip.file(fileName)?.async('string')
      if (content) {
        // Simple HTML to text conversion
        const text = content
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&apos;/g, "'")
          .replace(/\s+/g, ' ')
          .trim()
        
        if (text.length > 20) {
          fullText += text + '\n\n'
        }
      }
    }
    
    return fullText.trim()
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase()
    
    try {
      if (fileName.endsWith('.epub')) {
        return await extractTextFromEpub(file)
      } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
        return await file.text()
      }
    } catch (err) {
      console.error('Error extracting text:', err)
    }
    
    return ''
  }

  const handleConvert = async () => {
    if (!file) return
    setProcessing(true)
    setError('')
    setProgress(0)
    setAudioBlob(null)
    setDownloadUrl('')

    try {
      setProgress(10)
      
      // Extract text from ebook
      const text = await extractTextFromFile(file)
      
      if (!text || text.trim().length === 0) {
        setError(t('ebook_to_speech.no_content') || '未找到可转换的文本内容')
        setProcessing(false)
        return
      }
      
      setExtractedText(text.substring(0, 500) + (text.length > 500 ? '...' : ''))
      
      setProgress(30)
      
      // Check if Web Speech API is supported
      if (!('speechSynthesis' in window)) {
        setError(t('ebook_to_speech.not_supported') || '您的浏览器不支持语音合成')
        setProcessing(false)
        return
      }
      
      const synth = window.speechSynthesis
      const voices = synth.getVoices()
      
      // Find selected voice
      let voice = voices.find(v => v.name === selectedVoice) || 
                  voices.find(v => v.lang.startsWith('zh')) ||
                  voices[0]
      
      if (!voice) {
        setError(t('ebook_to_speech.no_voice') || '未找到可用的语音')
        setProcessing(false)
        return
      }
      
      setProgress(40)
      
      // Split text into manageable chunks
      const maxChunkLength = 8000 // Limit per utterance
      const sentences = text.match(/[^.!?。！？\n]+[.!?。！？\n]*/g) || [text]
      const chunks: string[] = []
      let currentChunk = ''
      
      for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxChunkLength) {
          if (currentChunk.trim()) chunks.push(currentChunk.trim())
          currentChunk = sentence
        } else {
          currentChunk += sentence
        }
      }
      if (currentChunk.trim()) chunks.push(currentChunk.trim())
      
      // Clean up any remaining chunks that are too long
      const finalChunks: string[] = []
      for (const chunk of chunks) {
        if (chunk.length > maxChunkLength) {
          // Split long chunks by character count
          for (let i = 0; i < chunk.length; i += maxChunkLength) {
            const subChunk = chunk.substring(i, i + maxChunkLength).trim()
            if (subChunk) finalChunks.push(subChunk)
          }
        } else {
          finalChunks.push(chunk)
        }
      }
      
      setProgress(50)

      // Setup audio recording using AudioContext and MediaRecorder
      let audioContext: AudioContext | null = null
      let mediaRecorder: MediaRecorder | null = null
      audioChunksRef.current = []

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioContext = new AudioContext()
        const source = audioContext.createMediaStreamSource(stream)
        
        // Use DynamicsCompressorNode to normalize audio
        const compressor = audioContext.createDynamicsCompressor()
        compressor.threshold.value = -24
        compressor.knee.value = 30
        compressor.ratio.value = 12
        compressor.attack.value = 0.003
        compressor.release.value = 0.25
        
        source.connect(compressor)
        compressor.connect(audioContext.destination)
        
        mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.start()
      } catch (err) {
        console.warn('Audio recording not available, will use playback only:', err)
      }
      
      // Play audio chunks sequentially
      let currentIndex = 0
      
      const playNextChunk = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          if (currentIndex >= finalChunks.length) {
            resolve()
            return
          }
          
          const chunk = finalChunks[currentIndex]
          const utterance = new SpeechSynthesisUtterance(chunk)
          utterance.voice = voice
          utterance.rate = speed
          utterance.lang = voice.lang || 'zh-CN'
          
          utterance.onend = () => {
            currentIndex++
            const progressValue = 50 + ((currentIndex) / finalChunks.length) * 50
            setProgress(Math.min(progressValue, 99))
            resolve()
          }
          
          utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error)
            currentIndex++
            resolve() // Continue even if one chunk fails
          }
          
          // Small delay before speaking
          setTimeout(() => {
            synth.speak(utterance)
          }, 100)
        })
      }
      
      // Play all chunks
      for (let i = 0; i < finalChunks.length; i++) {
        await playNextChunk()
        
        // Small pause between chunks
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // Stop recording and create audio blob
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        await new Promise<void>((resolve) => {
          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
            setAudioBlob(audioBlob)
            
            // Create download URL
            const url = URL.createObjectURL(audioBlob)
            setDownloadUrl(url)
            
            // Clean up audio context
            if (audioContext) {
              audioContext.close()
            }
            
            resolve()
          }
          mediaRecorder.stop()
        })
      } else {
        // No recording available, just set preview
        setDownloadUrl('preview')
      }
      
      setProgress(100)
      setProcessing(false)
      
    } catch (err: any) {
      console.error('Conversion error:', err)
      setError(err.message || t('ebook_to_speech.failed'))
      setProcessing(false)
    }
  }

  const handleDownloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      const link = document.createElement('a')
      link.href = url
      const fileName = file?.name.replace(/\.[^/.]+$/, '') || 'ebook'
      link.download = `${fileName}_audio.mp3`
      link.click()
      URL.revokeObjectURL(url)
    } else if (downloadUrl && downloadUrl !== 'preview') {
      const link = document.createElement('a')
      link.href = downloadUrl
      const fileName = file?.name.replace(/\.[^/.]+$/, '') || 'ebook'
      link.download = `${fileName}_audio.mp3`
      link.click()
    }
  }

  const handlePlay = () => {
    if (!extractedText) return
    
    const synth = window.speechSynthesis
    const voices = synth.getVoices()
    const voice = voices.find(v => v.name === selectedVoice) || 
                  voices.find(v => v.lang.startsWith('zh')) ||
                  voices[0]
    
    if (voice) {
      const utterance = new SpeechSynthesisUtterance(extractedText)
      utterance.voice = voice
      utterance.rate = speed
      utterance.lang = voice.lang || 'zh-CN'
      synth.speak(utterance)
    }
  }

  const handleStop = () => {
    window.speechSynthesis.cancel()
  }

  const handleConvertAnother = () => {
    handleStop()
    if (audioBlob) {
      URL.revokeObjectURL(downloadUrl)
      setAudioBlob(null)
    }
    setDownloadUrl('')
    setProgress(0)
    setExtractedText('')
    clearFile()
  }

  // Group voices by language
  const voicesByLanguage = availableVoices.reduce((acc, voice) => {
    const lang = voice.lang.split('-')[0]
    if (!acc[lang]) acc[lang] = []
    acc[lang].push(voice)
    return acc
  }, {} as Record<string, SpeechSynthesisVoice[]>)

  const languageNames: Record<string, string> = {
    'zh': '中文',
    'en': 'English',
    'ja': '日本語',
    'ko': '한국어',
    'fr': 'Français',
    'de': 'Deutsch',
    'es': 'Español',
    'pt': 'Português',
    'ru': 'Русский',
    'ar': 'العربية',
    'it': 'Italiano',
    'nl': 'Nederlands',
    'pl': 'Polski',
    'sv': 'Svenska',
    'tr': 'Türkçe',
  }

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('nav.ebook_to_speech')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('ebook_to_speech.description')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {!downloadUrl ? (
            <>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={getAcceptedFormats()}
                  onChange={handleFileChange}
                  className="hidden"
                  id="ebook-upload"
                />
                <div className="cursor-pointer">
                  <div className="text-6xl mb-4">🎧</div>
                  <p className="text-lg text-gray-700 mb-2">
                    {file 
                      ? file.name 
                      : t('ebook_to_speech.upload')
                    }
                  </p>
                  {file && (
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {t('ebook_to_speech.supported')}
                  </p>
                </div>
              </div>

              {file && (
                <div className="mt-6 space-y-4">
                  {/* Voice Options */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">
                      {t('ebook_to_speech.voice_options')}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('ebook_to_speech.voice')}
                        </label>
                        <select
                          value={selectedVoice}
                          onChange={(e) => setSelectedVoice(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                        >
                          <optgroup label={languageNames['zh'] || '中文'}>
                            {voicesByLanguage['zh']?.map(v => (
                              <option key={v.name} value={v.name}>{v.name}</option>
                            ))}
                          </optgroup>
                          <optgroup label={languageNames['en'] || 'English'}>
                            {voicesByLanguage['en']?.map(v => (
                              <option key={v.name} value={v.name}>{v.name}</option>
                            ))}
                          </optgroup>
                          {Object.entries(voicesByLanguage)
                            .filter(([lang]) => !['zh', 'en'].includes(lang))
                            .map(([lang, voices]) => (
                              <optgroup key={lang} label={languageNames[lang] || lang}>
                                {voices.map(v => (
                                  <option key={v.name} value={v.name}>{v.name}</option>
                                ))}
                              </optgroup>
                            ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('ebook_to_speech.speed')}: {speed}x
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={speed}
                          onChange={(e) => setSpeed(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0.5x</span>
                          <span>1x</span>
                          <span>1.5x</span>
                          <span>2x</span>
                        </div>
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
                        {t('ebook_to_speech.processing')} {progress}%
                      </>
                    ) : (
                      t('ebook_to_speech.convert')
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
                    {t('ebook_to_speech.extracted_text')}
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
                  {t('ebook_to_speech.success_title')}
                </h3>
                <p className="text-gray-600">
                  {t('ebook_to_speech.success_desc')}
                </p>
              </div>

              {extractedText && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-medium text-gray-700 mb-2">
                    {t('ebook_to_speech.extracted_text')}
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {extractedText}
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={handlePlay}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('ebook_to_speech.play')}
                </button>
                
                <button
                  onClick={handleStop}
                  className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  {t('ebook_to_speech.stop')}
                </button>
                
                {audioBlob && (
                  <button
                    onClick={handleDownloadAudio}
                    className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('ebook_to_speech.download_audio')}
                  </button>
                )}
                
                <button
                  onClick={handleConvertAnother}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  {t('ebook_to_speech.convert_another')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('ebook_to_speech.features_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🔊</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('ebook_to_speech.feature1_title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('ebook_to_speech.feature1_desc')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🌍</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('ebook_to_speech.feature2_title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('ebook_to_speech.feature2_desc')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('ebook_to_speech.feature3_title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('ebook_to_speech.feature3_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('ebook_to_speech.how_it_works_title')}
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">1</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('ebook_to_speech.step1')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('ebook_to_speech.step1_desc')}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">2</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('ebook_to_speech.step2')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('ebook_to_speech.step2_desc')}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">3</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('ebook_to_speech.step3')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('ebook_to_speech.step3_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('ebook_to_speech.faq_title')}
          </h2>
          <div className="space-y-4">
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <span className="font-medium text-gray-900">
                  {t('ebook_to_speech.faq_q1') || '支持哪些格式？'}
                </span>
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="p-4 text-gray-600">
                {t('ebook_to_speech.faq_a1') || '支持 EPUB、TXT 和 Markdown 格式的电子书文件。'}
              </div>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <span className="font-medium text-gray-900">
                  {t('ebook_to_speech.faq_q2') || '转换后的音频可以下载吗？'}
                </span>
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="p-4 text-gray-600">
                {t('ebook_to_speech.faq_a2') || '是的，转换成功后点击"下载音频"按钮即可下载音频文件。'}
              </div>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <span className="font-medium text-gray-900">
                  {t('ebook_to_speech.faq_q3') || '支持哪些语言？'}
                </span>
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="p-4 text-gray-600">
                {t('ebook_to_speech.faq_a3') || '支持中文、英文、日语、韩语、法语、德语、西班牙语等多种语言的语音合成。语音选择会自动根据您的界面语言推荐。'}
              </div>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <span className="font-medium text-gray-900">
                  {t('ebook_to_speech.faq_q4') || '可以调整语速吗？'}
                </span>
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="p-4 text-gray-600">
                {t('ebook_to_speech.faq_a4') || '是的，您可以通过滑块调整语速，支持 0.5x 到 2x 的速度范围。'}
              </div>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <span className="font-medium text-gray-900">
                  {t('ebook_to_speech.faq_q5') || '语音质量如何？'}
                </span>
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="p-4 text-gray-600">
                {t('ebook_to_speech.faq_a5') || '我们使用浏览器内置的高质量语音合成引擎，音质清晰自然。不同浏览器的语音质量可能略有差异。'}
              </div>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <span className="font-medium text-gray-900">
                  {t('ebook_to_speech.faq_q6') || '我的文件安全吗？'}
                </span>
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="p-4 text-gray-600">
                {t('ebook_to_speech.faq_a6') || '是的，所有文件处理都在您的本地浏览器中进行，文件不会上传到服务器，确保您的隐私安全。'}
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
