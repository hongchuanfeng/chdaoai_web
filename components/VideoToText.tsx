'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef, useEffect, useCallback } from 'react'

export default function VideoToText() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcribedText, setTranscribedText] = useState<string>('')
  const [recognitionProgress, setRecognitionProgress] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState('en-US')
  const [videoDuration, setVideoDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [micStatus, setMicStatus] = useState<'idle' | 'listening' | 'error'>('idle')
  const [audioLevel, setAudioLevel] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const recognitionRef = useRef<any>(null)
  const fullTranscriptRef = useRef<string>('')
  const isProcessingRef = useRef<boolean>(false)
  const restartCountRef = useRef<number>(0)
  const resultContainerRef = useRef<HTMLDivElement>(null)
  const videoEndedRef = useRef(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const speechResultCountRef = useRef<number>(0)

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
      setTranscribedText('')
      setRecognitionProgress(0)
      setVideoDuration(0)
      setCurrentTime(0)
      setAudioLevel(0)
      setIsSpeaking(false)
      fullTranscriptRef.current = ''
      speechResultCountRef.current = 0
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
    setIsSpeaking(false)
  }, [])

  const handleClearFile = () => {
    stopRecognition()
    
    if (file && videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }
    setFile(null)
    setVideoUrl(null)
    setTranscribedText('')
    setRecognitionProgress(0)
    setVideoDuration(0)
    setCurrentTime(0)
    setAudioLevel(0)
    setIsSpeaking(false)
    videoEndedRef.current = false
    restartCountRef.current = 0
    speechResultCountRef.current = 0
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
      const progress = videoDuration > 0
        ? Math.min(95, (videoRef.current.currentTime / videoDuration) * 100)
        : 0
      setRecognitionProgress(progress)
    }
  }

  const handleVideoEnded = () => {
    videoEndedRef.current = true
    setIsProcessing(false)
    isProcessingRef.current = false
    setRecognitionProgress(100)
    stopRecognition()
  }

  useEffect(() => {
    return () => {
      stopRecognition()
    }
  }, [stopRecognition])

  const setupRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()
    recognition.lang = selectedLanguage
    recognition.continuous = true
    recognition.interimResults = true
    
    return recognition
  }, [selectedLanguage])

  const restartRecognition = useCallback(() => {
    if (!isProcessingRef.current || videoEndedRef.current) return
    
    restartCountRef.current++
    
    if (restartCountRef.current > 50) return
    
    try {
      const newRecognition = setupRecognition()
      if (newRecognition) {
        newRecognition.onresult = recognitionRef.current?.onresult
        newRecognition.onerror = recognitionRef.current?.onerror
        newRecognition.onend = recognitionRef.current?.onend
        newRecognition.onspeechstart = recognitionRef.current?.onspeechstart
        newRecognition.onspeechend = recognitionRef.current?.onspeechend
        
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

  const transcribeVideo = async () => {
    if (!file || !videoUrl || !videoRef.current) return

    setIsProcessing(true)
    setTranscribedText('')
    setRecognitionProgress(0)
    fullTranscriptRef.current = ''
    restartCountRef.current = 0
    videoEndedRef.current = false
    isProcessingRef.current = true
    setMicStatus('listening')
    setAudioLevel(0)
    setIsSpeaking(false)
    speechResultCountRef.current = 0

    try {
      // 请求麦克风权限并获取音频流
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      
      // 启动音频电平监控
      startAudioLevelMonitor(stream)

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (!SpeechRecognition) {
        setTranscribedText(t('video_to_text.browser_not_supported') || 'Your browser does not support speech recognition. Please try using Chrome or Edge.')
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
            speechResultCountRef.current++
          } else {
            interimTranscript += transcript
          }
        }
        
        if (newFinalText) {
          fullTranscriptRef.current += newFinalText
        }
        
        const displayText = fullTranscriptRef.current + interimTranscript
        setTranscribedText(displayText)
        
        if (speechResultCountRef.current > 0) {
          setIsSpeaking(true)
        }
      }

      recognition.onerror = (event: any) => {
        console.log('Recognition error:', event.error)
        
        if (event.error === 'no-speech') {
          setIsSpeaking(false)
          return
        }
        
        if (event.error === 'aborted') {
          return
        }
        
        if (event.error === 'not-allowed') {
          setTranscribedText(t('video_to_text.microphone_error') || 'Microphone access denied. Please allow microphone access in your browser settings and refresh the page.')
          setIsProcessing(false)
          setMicStatus('error')
          stopRecognition()
          return
        }
        
        if (event.error === 'network') {
          setTimeout(() => {
            if (isProcessingRef.current) {
              restartRecognition()
            }
          }, 2000)
          return
        }

        if (restartCountRef.current < 50 && isProcessingRef.current && !videoEndedRef.current) {
          setTimeout(() => {
            if (isProcessingRef.current && !videoEndedRef.current) {
              restartRecognition()
            }
          }, 1000)
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

      recognition.onspeechstart = () => {
        setIsSpeaking(true)
      }

      recognition.onspeechend = () => {
        // 不要立即设置false，让它保持一会儿
      }

      try {
        recognition.start()
      } catch (e) {
        console.error('Failed to start recognition:', e)
        setTranscribedText('Failed to start speech recognition. Please refresh and try again.')
        setIsProcessing(false)
        setMicStatus('error')
        return
      }

      videoRef.current.currentTime = 0
      try {
        await videoRef.current.play()
      } catch (e) {
        console.error('Video play error:', e)
      }

      // Safety timeout
      const timeoutDuration = Math.max(60000, videoDuration * 1000 * 2 + 30000)
      setTimeout(() => {
        if (isProcessingRef.current) {
          videoEndedRef.current = true
          stopRecognition()
          setRecognitionProgress(100)
          setIsProcessing(false)
        }
      }, timeoutDuration)

    } catch (error) {
      console.error('Error:', error)
      setIsProcessing(false)
      setMicStatus('error')
      stopRecognition()
      setTranscribedText(t('video_to_text.error_message') || 'An error occurred during transcription. Please try again.')
    }
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(transcribedText)
  }

  const handleDownloadText = () => {
    const blob = new Blob([transcribedText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'video_transcription'
    link.download = baseName + '_transcription.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleProcessAnother = () => {
    stopRecognition()
    setTranscribedText('')
    setRecognitionProgress(0)
    handleClearFile()
  }

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('video_to_text.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('video_to_text.description')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {!file ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition cursor-pointer"
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
                <div className="text-6xl mb-4">🎥</div>
                <p className="text-lg text-gray-700 mb-2">
                  {t('video_to_text.upload_title')}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  {t('video_to_text.click_to_upload')}
                </p>
                <p className="text-sm text-gray-400">
                  {t('video_to_text.supported_formats')}
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
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

              {videoUrl && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t('video_to_text.preview') || 'Preview'}
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

              {!transcribedText && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('video_to_text.select_language') || 'Select Language'}
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-black"
                    disabled={isProcessing}
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!transcribedText && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    {t('video_to_text.tip') || 'Tip: Please ensure your computer\'s microphone is working and close to the speaker playing the video audio. The speech recognition will capture audio from your microphone.'}
                  </p>
                </div>
              )}

              {!transcribedText && (
                <button
                  onClick={transcribeVideo}
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
                    ? `${t('video_to_text.processing')} ${Math.round(recognitionProgress)}%`
                    : t('video_to_text.extract_text')
                  }
                </button>
              )}

              {isProcessing && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>
                      {t('video_to_text.listening') || 'Listening...'}
                      {micStatus === 'listening' && (
                        <span className="ml-2 inline-flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                          <span className="text-green-600">Mic Active</span>
                        </span>
                      )}
                      {micStatus === 'error' && (
                        <span className="ml-2 text-red-500">Mic Error</span>
                      )}
                    </span>
                    <span>{Math.round(currentTime)}s / {Math.round(videoDuration)}s</span>
                  </div>
                  
                  {/* 音频电平指示器 */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Audio Level:</span>
                      <span>{Math.round(audioLevel)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-100 ${audioLevel > 50 ? 'bg-green-500' : audioLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${audioLevel}%` }}
                      ></div>
                    </div>
                    {audioLevel < 20 && (
                      <p className="text-xs text-red-500 mt-1">
                        Audio level too low! Please increase volume or move closer to the speaker.
                      </p>
                    )}
                  </div>
                  
                  {/* 语音检测指示 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">Speech Detection:</span>
                    <span className={`px-2 py-1 rounded text-xs ${isSpeaking ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {isSpeaking ? 'Speaking...' : 'Waiting...'}
                    </span>
                    {speechResultCountRef.current > 0 && (
                      <span className="text-xs text-green-600">
                        ({speechResultCountRef.current} phrases detected)
                      </span>
                    )}
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${recognitionProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* 实时显示识别结果区域 */}
              {(transcribedText || isProcessing) && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                    {t('video_to_text.result_title') || 'Transcription Result'}
                    {isProcessing && (
                      <span className="ml-2 text-sm font-normal text-green-600 animate-pulse">
                        (实时识别中...)
                      </span>
                    )}
                  </h3>

                  <div 
                    ref={resultContainerRef}
                    className="bg-gray-50 p-4 rounded-lg mb-6 max-h-96 overflow-y-auto min-h-[100px]"
                  >
                    {transcribedText ? (
                      <p className="text-gray-700 whitespace-pre-wrap">{transcribedText}</p>
                    ) : (
                      <p className="text-gray-400 italic">
                        {isProcessing ? '正在聆听音频，请稍候...' : 'No text detected yet'}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={handleCopyText}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
                      disabled={!transcribedText}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      {t('video_to_text.copy') || t('common.copy')}
                    </button>
                    <button
                      onClick={handleDownloadText}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
                      disabled={!transcribedText}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {t('video_to_text.download') || t('common.download')}
                    </button>
                    <button
                      onClick={handleProcessAnother}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      {t('video_to_text.another') || t('common.another')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('video_to_text.how_to_use_title')}
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">1</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('video_to_text.how_to_use_step1')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('video_to_text.how_to_use_step1_desc')}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">2</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('video_to_text.how_to_use_step2')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('video_to_text.how_to_use_step2_desc')}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">3</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('video_to_text.how_to_use_step3')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('video_to_text.how_to_use_step3_desc')}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">4</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('video_to_text.how_to_use_step4')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('video_to_text.how_to_use_step4_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('video_to_text.faq_title')}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">
                {t('video_to_text.faq_q1')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('video_to_text.faq_a1')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('video_to_text.faq_q2')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('video_to_text.faq_a2')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('video_to_text.faq_q3')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('video_to_text.faq_a3')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('video_to_text.faq_q4')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('video_to_text.faq_a4')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('video_to_text.faq_q5')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('video_to_text.faq_a5')}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            {t('video_to_text.examples_title')}
          </h2>
          <p className="text-center text-gray-600 mb-12">
            {t('video_to_text.examples_desc')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src="/video/text/1.jpg"
                alt={t('video_to_text.example_desc1')}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-600 font-medium">{t('video_to_text.example_desc1')}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src="/video/text/2.jpg"
                alt={t('video_to_text.example_desc2')}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-600 font-medium">{t('video_to_text.example_desc2')}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src="/video/text/3.jpg"
                alt={t('video_to_text.example_desc3')}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-600 font-medium">{t('video_to_text.example_desc3')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
