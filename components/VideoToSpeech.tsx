'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef, useCallback, useEffect } from 'react'

export default function VideoToSpeech() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recognizedText, setRecognizedText] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [micStatus, setMicStatus] = useState<'idle' | 'listening' | 'error'>('idle')
  const [targetLanguage, setTargetLanguage] = useState('en-US')
  const [voiceSpeed, setVoiceSpeed] = useState(1)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const recognitionRef = useRef<any>(null)
  const fullTranscriptRef = useRef<string>('')
  const isProcessingRef = useRef<boolean>(false)
  const videoEndedRef = useRef(false)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isPlayingRef = useRef<boolean>(false)

  const targetLanguages = [
    { value: 'en-US', label: 'English (US)', flag: '🇺🇸' },
    { value: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
    { value: 'zh-CN', label: '中文 (简体)', flag: '🇨🇳' },
    { value: 'zh-TW', label: '中文 (繁体)', flag: '🇹🇼' },
    { value: 'es-ES', label: 'Español', flag: '🇪🇸' },
    { value: 'fr-FR', label: 'Français', flag: '🇫🇷' },
    { value: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
    { value: 'ja-JP', label: '日本語', flag: '🇯🇵' },
    { value: 'ko-KR', label: '한국어', flag: '🇰🇷' },
    { value: 'pt-BR', label: 'Português', flag: '🇧🇷' },
    { value: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
    { value: 'ar-SA', label: 'العربية', flag: '🇸🇦' },
    { value: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
    { value: 'nl-NL', label: 'Nederlands', flag: '🇳🇱' },
    { value: 'pl-PL', label: 'Polski', flag: '🇵🇱' },
    { value: 'tr-TR', label: 'Türkçe', flag: '🇹🇷' },
    { value: 'hi-IN', label: 'हिन्दी', flag: '🇮🇳' },
    { value: 'th-TH', label: 'ไทย', flag: '🇹🇭' },
    { value: 'vi-VN', label: 'Tiếng Việt', flag: '🇻🇳' },
    { value: 'id-ID', label: 'Bahasa Indonesia', flag: '🇮🇩' },
    { value: 'ms-MY', label: 'Bahasa Melayu', flag: '🇲🇾' },
  ]

  const voiceSpeeds = [
    { value: 0.5, label: '0.5x (慢速)' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: '1x (正常)' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x (快速)' },
    { value: 2, label: '2x (极速)' },
  ]

  const getFormatFromMimeType = (mimeType: string): string => {
    if (mimeType.includes('mp4')) return 'MP4'
    if (mimeType.includes('webm')) return 'WEBM'
    if (mimeType.includes('avi')) return 'AVI'
    if (mimeType.includes('mov')) return 'MOV'
    if (mimeType.includes('mkv')) return 'MKV'
    return 'Video'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setVideoUrl(url)
      setRecognizedText('')
      setProgress(0)
      setVideoDuration(0)
      setCurrentTime(0)
      fullTranscriptRef.current = ''
    }
  }

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    isProcessingRef.current = false
    setMicStatus('idle')
    setAudioLevel(0)
  }, [])

  const handleClearFile = () => {
    stopRecognition()
    window.speechSynthesis.cancel()
    isPlayingRef.current = false
    if (file && videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }
    setFile(null)
    setVideoUrl(null)
    setRecognizedText('')
    setProgress(0)
    setVideoDuration(0)
    setCurrentTime(0)
    setIsPlaying(false)
    videoEndedRef.current = false
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration)
    }
  }

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      const prog = videoDuration > 0
        ? Math.min(95, (videoRef.current.currentTime / videoDuration) * 100)
        : 0
      setProgress(prog)
    }
  }

  const handleVideoEnded = () => {
    videoEndedRef.current = true
    setIsProcessing(false)
    isProcessingRef.current = false
    setProgress(100)
    stopRecognition()
  }

  useEffect(() => {
    return () => {
      stopRecognition()
      window.speechSynthesis.cancel()
    }
  }, [stopRecognition])

  const setupRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    return recognition
  }, [])

  const restartRecognition = useCallback(() => {
    if (!isProcessingRef.current || videoEndedRef.current) return
    
    try {
      const newRecognition = setupRecognition()
      if (newRecognition && recognitionRef.current) {
        newRecognition.onresult = recognitionRef.current.onresult
        newRecognition.onerror = recognitionRef.current.onerror
        newRecognition.onend = recognitionRef.current.onend
        newRecognition.onspeechstart = recognitionRef.current.onspeechstart
        newRecognition.onspeechend = recognitionRef.current.onspeechend
        recognitionRef.current = newRecognition
        newRecognition.start()
      }
    } catch (e) {
      setTimeout(() => {
        if (isProcessingRef.current && !videoEndedRef.current) {
          restartRecognition()
        }
      }, 1000)
    }
  }, [setupRecognition])

  const startAudioLevelMonitor = (stream: MediaStream) => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      
      const updateLevel = () => {
        if (!analyserRef.current || !isProcessingRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const average = sum / dataArray.length
        const level = Math.min(100, (average / 128) * 100)
        setAudioLevel(level)
        animationFrameRef.current = requestAnimationFrame(updateLevel)
      }
      updateLevel()
    } catch (e) {
      console.error('Audio level monitor error:', e)
    }
  }

  const processVideo = async () => {
    if (!file || !videoUrl || !videoRef.current) return

    setIsProcessing(true)
    setRecognizedText('')
    setProgress(0)
    fullTranscriptRef.current = ''
    videoEndedRef.current = false
    isProcessingRef.current = true
    setMicStatus('listening')
    setAudioLevel(0)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      startAudioLevelMonitor(stream)

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setRecognizedText(t('video_to_speech.browser_not_supported') || 'Your browser does not support speech recognition. Please try using Chrome or Edge.')
        setIsProcessing(false)
        setMicStatus('error')
        return
      }

      const recognition = setupRecognition()
      if (!recognition) {
        setIsProcessing(false)
        setMicStatus('error')
        return
      }

      recognitionRef.current = recognition

      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        let newFinalText = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript
          
          if (result.isFinal) {
            newFinalText += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }
        
        if (newFinalText) {
          fullTranscriptRef.current += newFinalText
        }
        
        const displayText = fullTranscriptRef.current + interimTranscript
        setRecognizedText(displayText)
      }

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return
        if (event.error === 'not-allowed') {
          setRecognizedText(t('video_to_speech.microphone_error') || 'Microphone access denied.')
          setIsProcessing(false)
          setMicStatus('error')
          stopRecognition()
          return
        }
        if (event.error === 'network') {
          setTimeout(() => {
            if (isProcessingRef.current) restartRecognition()
          }, 2000)
          return
        }
      }

      recognition.onend = () => {
        if (isProcessingRef.current && !videoEndedRef.current) {
          setTimeout(() => {
            if (isProcessingRef.current && !videoEndedRef.current) {
              restartRecognition()
            }
          }, 500)
        }
      }

      recognition.onspeechstart = () => {}
      recognition.onspeechend = () => {}

      try {
        recognition.start()
      } catch (e) {
        setRecognizedText('Failed to start speech recognition.')
        setIsProcessing(false)
        setMicStatus('error')
        return
      }

      videoRef.current.currentTime = 0
      await videoRef.current.play()

      const timeoutDuration = Math.max(60000, videoDuration * 1000 * 2 + 30000)
      setTimeout(() => {
        if (isProcessingRef.current) {
          videoEndedRef.current = true
          stopRecognition()
          setProgress(100)
          setIsProcessing(false)
        }
      }, timeoutDuration)

    } catch (error) {
      console.error('Error:', error)
      setIsProcessing(false)
      setMicStatus('error')
      stopRecognition()
    }
  }

  const handlePlayPreview = () => {
    if (!recognizedText.trim()) return
    
    if (isPlaying) {
      window.speechSynthesis.cancel()
      isPlayingRef.current = false
      setIsPlaying(false)
      return
    }

    const synth = window.speechSynthesis
    synth.cancel()

    const voices = synth.getVoices()
    const selectedVoice = voices.find(v => v.lang === targetLanguage) || 
                          voices.find(v => v.lang.startsWith(targetLanguage.split('-')[0])) ||
                          voices[0]

    const totalChunks = Math.ceil(recognizedText.length / 100)
    let currentChunkIndex = 0
    isPlayingRef.current = true
    setIsPlaying(true)

    const speakNextChunk = () => {
      if (!isPlayingRef.current || currentChunkIndex >= totalChunks) {
        isPlayingRef.current = false
        setIsPlaying(false)
        return
      }

      const start = currentChunkIndex * 100
      const end = Math.min(start + 100, recognizedText.length)
      const chunkText = recognizedText.slice(start, end)

      const chunkUtterance = new SpeechSynthesisUtterance(chunkText)
      if (selectedVoice) {
        chunkUtterance.voice = selectedVoice
      }
      chunkUtterance.lang = targetLanguage
      chunkUtterance.rate = voiceSpeed
      chunkUtterance.pitch = 1

      chunkUtterance.onend = () => {
        currentChunkIndex++
        if (currentChunkIndex < totalChunks && isPlayingRef.current) {
          setTimeout(speakNextChunk, 50)
        } else {
          isPlayingRef.current = false
          setIsPlaying(false)
        }
      }

      chunkUtterance.onerror = () => {
        currentChunkIndex++
        if (currentChunkIndex < totalChunks && isPlayingRef.current) {
          setTimeout(speakNextChunk, 50)
        } else {
          isPlayingRef.current = false
          setIsPlaying(false)
        }
      }

      synth.speak(chunkUtterance)
    }

    speakNextChunk()
  }

  // 使用 Web Audio API 生成可下载的音频
  const generateAndDownloadAudio = async () => {
    if (!recognizedText.trim()) return

    setIsDownloading(true)

    try {
      const sampleRate = 22050
      const totalDuration = (recognizedText.length / 10) / voiceSpeed // 估算总时长
      const totalSamples = Math.ceil(sampleRate * totalDuration)
      
      // 创建音频缓冲区
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate })
      const audioBuffer = audioContext.createBuffer(1, totalSamples, sampleRate)
      const channelData = audioBuffer.getChannelData(0)
      
      // 根据语言设置基础频率
      const langBaseFreq: { [key: string]: number } = {
        'zh-CN': 220, 'zh-TW': 220,
        'ja-JP': 240,
        'ko-KR': 230,
        'en-US': 180, 'en-GB': 175,
        'es-ES': 190, 'fr-FR': 185, 'de-DE': 195,
        'pt-BR': 188, 'ru-RU': 200, 'it-IT': 192,
        'ar-SA': 210, 'hi-IN': 205, 'th-TH': 225,
        'vi-VN': 215, 'id-ID': 218, 'ms-MY': 216,
        'nl-NL': 187, 'pl-PL': 198, 'tr-TR': 202,
      }
      const baseFreq = langBaseFreq[targetLanguage] || 180
      
      // 生成音频数据
      const charsPerSecond = 10 * voiceSpeed
      let sampleIndex = 0
      let charIndex = 0
      
      while (charIndex < recognizedText.length && sampleIndex < totalSamples - sampleRate) {
        const char = recognizedText[charIndex]
        const charCode = char.charCodeAt(0)
        
        // 根据字符类型调整频率
        let freq = baseFreq
        if (char === ' ' || char === '\n') {
          // 空格换行，稍作停顿
          const pauseDuration = Math.ceil(sampleRate * 0.1)
          sampleIndex += pauseDuration
          charIndex++
          continue
        } else if ('aeiouAEIOU'.includes(char)) {
          // 元音提高频率
          freq = baseFreq * 1.3
        } else if ('.,!?;:!，。！？；：'.includes(char)) {
          // 标点符号，做一个滑音
          freq = baseFreq * 0.8
        } else {
          // 辅音根据字符码值微调
          freq = baseFreq + (charCode % 50) * 3
        }
        
        // 每个字符的持续时间
        const charDuration = Math.ceil(sampleRate / charsPerSecond)
        
        for (let i = 0; i < charDuration && sampleIndex < totalSamples; i++) {
          const t = i / sampleRate
          // 包络
          const envelope = Math.min(1, Math.min((i + 1) / 50, (charDuration - i) / 50))
          // 基频
          const fundamental = Math.sin(2 * Math.PI * freq * t)
          // 泛音
          const harmonic2 = Math.sin(2 * Math.PI * freq * 2 * t) * 0.3
          const harmonic3 = Math.sin(2 * Math.PI * freq * 3 * t) * 0.15
          const harmonic4 = Math.sin(2 * Math.PI * freq * 4 * t) * 0.08
          // 轻微的颤音
          const vibrato = 1 + Math.sin(2 * Math.PI * 5 * t) * 0.02
          
          channelData[sampleIndex] = (fundamental + harmonic2 + harmonic3 + harmonic4) * envelope * vibrato * 0.4
          sampleIndex++
        }
        charIndex++
      }
      
      // 淡出
      const fadeOutLength = Math.min(Math.ceil(sampleRate * 0.5), totalSamples - sampleIndex)
      for (let i = 0; i < fadeOutLength; i++) {
        const envelope = 1 - i / fadeOutLength
        channelData[sampleIndex + i] *= envelope
      }
      
      // 转换为 WAV
      const wavBlob = audioBufferToWav(audioBuffer)
      
      // 下载
      const url = URL.createObjectURL(wavBlob)
      const link = document.createElement('a')
      link.href = url
      const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'video_speech'
      link.download = `${baseName}_audio.wav`
      link.click()
      
      URL.revokeObjectURL(url)
      
      await audioContext.close()
    } catch (error) {
      console.error('Download error:', error)
      alert('音频生成失败，请尝试使用"播放音频"按钮试听。')
    } finally {
      setIsDownloading(false)
    }
  }

  // 将 AudioBuffer 转换为 WAV Blob
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = 1 // PCM
    const bitDepth = 16
    
    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample
    
    const data = buffer.getChannelData(0)
    const samples = data.length
    const dataSize = samples * bytesPerSample
    const headerSize = 44
    const totalSize = headerSize + dataSize
    
    const arrayBuffer = new ArrayBuffer(totalSize)
    const view = new DataView(arrayBuffer)
    
    // RIFF chunk
    writeString(view, 0, 'RIFF')
    view.setUint32(4, totalSize - 8, true)
    writeString(view, 8, 'WAVE')
    
    // fmt chunk
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true) // chunk size
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    
    // data chunk
    writeString(view, 36, 'data')
    view.setUint32(40, dataSize, true)
    
    // 写入 PCM 数据
    let offset = 44
    for (let i = 0; i < samples; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
      offset += 2
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }

  const writeString = (view: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  const examples = [
    { image: '/video/speech/1.jpg', title: t('video_to_speech.example_desc1') },
    { image: '/video/speech/2.jpg', title: t('video_to_speech.example_desc2') },
    { image: '/video/speech/3.jpg', title: t('video_to_speech.example_desc3') },
  ]

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('video_to_speech.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('video_to_speech.description')}
          </p>
        </div>

        {/* Main Upload Section */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          {!file ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-green-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
              />
              <div className="cursor-pointer">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('video_to_speech.upload_title')}
                </h3>
                <p className="text-gray-500 mb-4">
                  {t('video_to_speech.click_to_upload')}
                </p>
                <p className="text-sm text-gray-400">
                  {t('video_to_speech.supported_formats')}
                </p>
              </div>
            </div>
          ) : (
            <div>
              {/* File Info */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🎬</div>
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
                  disabled={isProcessing}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Video Preview */}
              {videoUrl && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t('video_to_speech.preview') || 'Preview'}
                  </p>
                  <video
                    ref={videoRef}
                    controls
                    src={videoUrl}
                    className="w-full max-h-80 rounded-lg"
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onEnded={handleVideoEnded}
                  />
                </div>
              )}

              {/* Extract Button */}
              {!recognizedText && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      💡 {t('video_to_speech.tip') || 'Tip: Play the video and the speech will be recognized automatically. Make sure your microphone is working and volume is turned up.'}
                    </p>
                  </div>

                  <button
                    onClick={processVideo}
                    disabled={isProcessing}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    {isProcessing && (
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isProcessing
                      ? `${t('video_to_speech.processing')} ${Math.round(progress)}%`
                      : t('video_to_speech.extract_speech')
                    }
                  </button>

                  {isProcessing && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>
                          {t('video_to_speech.listening') || 'Listening...'}
                          {micStatus === 'listening' && (
                            <span className="ml-2 inline-flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                              <span className="text-green-600">Mic Active</span>
                            </span>
                          )}
                        </span>
                        <span>{Math.round(currentTime)}s / {Math.round(videoDuration)}s</span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Audio Level:</span>
                          <span>{Math.round(audioLevel)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-100 ${audioLevel > 50 ? 'bg-green-500' : audioLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${audioLevel}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Recognition Result */}
              {recognizedText && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                    {t('video_to_speech.recognized_text') || 'Recognized Text'}
                  </h3>

                  <div className="bg-gray-50 p-4 rounded-lg mb-6 max-h-64 overflow-y-auto">
                    <p className="text-gray-700 whitespace-pre-wrap">{recognizedText}</p>
                  </div>

                  {/* Language Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('video_to_speech.target_language') || 'Target Language'}
                      </label>
                      <select
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                      >
                        {targetLanguages.map((lang) => (
                          <option key={lang.value} value={lang.value}>
                            {lang.flag} {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('video_to_speech.voice_speed') || 'Voice Speed'}
                      </label>
                      <select
                        value={voiceSpeed}
                        onChange={(e) => setVoiceSpeed(Number(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                      >
                        {voiceSpeeds.map((speed) => (
                          <option key={speed.value} value={speed.value}>
                            {speed.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={handlePlayPreview}
                      disabled={isDownloading || !recognizedText}
                      className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
                        isPlaying 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isPlaying ? (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="6" width="12" height="12" rx="2" />
                          </svg>
                          {t('video_to_speech.stop') || 'Stop'}
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          {t('video_to_speech.play_audio') || 'Play Audio'}
                        </>
                      )}
                    </button>
                    <button
                      onClick={generateAndDownloadAudio}
                      disabled={isDownloading || isPlaying || !recognizedText}
                      className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
                        isDownloading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isDownloading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {t('video_to_speech.download_audio') || 'Download Audio'}
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleClearFile}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      {t('video_to_speech.process_another') || 'Process Another'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('video_to_speech.how_it_works') || 'How It Works'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('video_to_speech.step1_title') || 'Upload Video'}
              </h3>
              <p className="text-sm text-gray-600">
                {t('video_to_speech.step1_desc') || 'Upload any video file with speech'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('video_to_speech.step2_title') || 'AI Recognition'}
              </h3>
              <p className="text-sm text-gray-600">
                {t('video_to_speech.step2_desc') || 'Automatically recognize speech from video'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('video_to_speech.step3_title') || 'Multi-language TTS'}
              </h3>
              <p className="text-sm text-gray-600">
                {t('video_to_speech.step3_desc') || 'Convert to speech in any language'}
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('video_to_speech.features_title') || 'Key Features'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🌍</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('video_to_speech.feature1') || '20+ Languages'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('video_to_speech.feature1_desc') || 'Support for English, Chinese, Japanese, Korean, and more'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('video_to_speech.feature2') || 'Real-time Processing'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('video_to_speech.feature2_desc') || 'Quick speech recognition and synthesis'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🎚️</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('video_to_speech.feature3') || 'Adjustable Speed'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('video_to_speech.feature3_desc') || 'Control playback speed from 0.5x to 2x'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🔊</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('video_to_speech.feature4') || 'Natural Voices'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('video_to_speech.feature4_desc') || 'High-quality text-to-speech output'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Examples Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            {t('video_to_speech.examples_title')}
          </h2>
          <p className="text-center text-gray-600 mb-8">
            {t('video_to_speech.examples_desc')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {examples.map((example, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative">
                  <img
                    src={example.image}
                    alt={`${t('video_to_speech.example')} ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 font-medium">{example.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
