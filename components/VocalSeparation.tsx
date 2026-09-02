'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

export default function VocalSeparation() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [vocalsUrl, setVocalsUrl] = useState<string | null>(null)
  const [instrumentalUrl, setInstrumentalUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPlayTrack, setCurrentPlayTrack] = useState<'original' | 'vocals' | 'instrumental' | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setAudioUrl(url)
      setVocalsUrl(null)
      setInstrumentalUrl(null)
      setProgress(0)
    }
  }

  const handleRemoveFile = () => {
    if (file) {
      URL.revokeObjectURL(audioUrl!)
    }
    if (vocalsUrl) URL.revokeObjectURL(vocalsUrl)
    if (instrumentalUrl) URL.revokeObjectURL(instrumentalUrl)
    setFile(null)
    setAudioUrl(null)
    setVocalsUrl(null)
    setInstrumentalUrl(null)
    setProgress(0)
    setIsPlaying(false)
    setCurrentPlayTrack(null)
  }

  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = 1
    const bitDepth = 16

    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample
    const dataLength = buffer.length * blockAlign
    const headerLength = 44
    const totalLength = headerLength + dataLength

    const arrayBuffer = new ArrayBuffer(totalLength)
    const view = new DataView(arrayBuffer)

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, totalLength - 8, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeString(36, 'data')
    view.setUint32(40, dataLength, true)

    const channelData: Float32Array[] = []
    for (let i = 0; i < numChannels; i++) {
      channelData.push(buffer.getChannelData(i))
    }

    let offset = 44
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][i]))
        const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff
        view.setInt16(offset, int16, true)
        offset += 2
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }

  const handleSeparate = async () => {
    if (!audioUrl) return

    setProcessing(true)
    setProgress(0)

    try {
      const audioContext = new AudioContext()
      
      setProgress(10)
      
      const response = await fetch(audioUrl)
      const arrayBuffer = await response.arrayBuffer()
      
      setProgress(30)
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      setProgress(50)

      const numberOfChannels = audioBuffer.numberOfChannels
      const length = audioBuffer.length
      const sampleRate = audioBuffer.sampleRate

      const vocalsBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate)
      const instrumentalBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate)

      for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel)
        const vocalsData = vocalsBuffer.getChannelData(channel)
        const instrumentalData = instrumentalBuffer.getChannelData(channel)

        const centerChannel = channelData
        
        for (let i = 0; i < length; i++) {
          const sample = centerChannel[i]
          
          const windowSize = 1024
          const iStart = Math.max(0, i - windowSize / 2)
          const iEnd = Math.min(length, i + windowSize / 2)
          
          let energy = 0
          for (let j = Math.floor(iStart); j < Math.floor(iEnd); j++) {
            energy += centerChannel[j] * centerChannel[j]
          }
          const rms = Math.sqrt(energy / (iEnd - iStart))
          
          const threshold = 0.05
          const vocalPresence = Math.min(1, rms / threshold)
          
          vocalsData[i] = sample * vocalPresence * 0.8
          instrumentalData[i] = sample * (1 - vocalPresence * 0.5)
        }
      }

      setProgress(70)

      const vocalsBlob = audioBufferToWav(vocalsBuffer)
      const vocalsUrlResult = URL.createObjectURL(vocalsBlob)
      setVocalsUrl(vocalsUrlResult)

      setProgress(85)

      const instrumentalBlob = audioBufferToWav(instrumentalBuffer)
      const instrumentalUrlResult = URL.createObjectURL(instrumentalBlob)
      setInstrumentalUrl(instrumentalUrlResult)

      setProgress(100)
    } catch (error) {
      console.error('Error separating audio:', error)
    }

    setProcessing(false)
  }

  const handlePlay = (track: 'original' | 'vocals' | 'instrumental') => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    
    let url: string | null = null
    if (track === 'original') url = audioUrl
    else if (track === 'vocals') url = vocalsUrl
    else if (track === 'instrumental') url = instrumentalUrl
    
    if (url && audioRef.current) {
      audioRef.current.src = url
      audioRef.current.play()
      setIsPlaying(true)
      setCurrentPlayTrack(track)
    }
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleDownload = (track: 'vocals' | 'instrumental') => {
    const url = track === 'vocals' ? vocalsUrl : instrumentalUrl
    if (!url) return
    
    const link = document.createElement('a')
    link.download = track === 'vocals' ? 'vocals.wav' : 'instrumental.wav'
    link.href = url
    link.click()
  }

  const handleProcessAnother = () => {
    handleRemoveFile()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <>
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('nav.vocal_separation')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('vocal_separation.description')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8">
            {!file ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="audio-upload"
                />
                <label htmlFor="audio-upload" className="cursor-pointer">
                  <div className="text-6xl mb-4">🎤</div>
                  <p className="text-lg text-gray-700 mb-2">
                    {t('vocal_separation.upload')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('vocal_separation.supported')}
                  </p>
                </label>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">🎵</div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="p-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {audioUrl && !vocalsUrl && !processing && (
                  <button
                    onClick={handleSeparate}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    {t('vocal_separation.separate')}
                  </button>
                )}

                {processing && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{t('vocal_separation.processing')}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm text-gray-500">{progress}%</p>
                  </div>
                )}

                {vocalsUrl && instrumentalUrl && !processing && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('vocal_separation.result_title') || '分离结果'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t('vocal_separation.result_desc') || '人声和伴奏已成功分离'}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                          <span>🎤</span>
                          {t('vocal_separation.vocals') || '人声'}
                        </h4>
                        <audio 
                          controls 
                          src={vocalsUrl} 
                          className="w-full mb-3"
                        />
                        <button
                          onClick={() => handleDownload('vocals')}
                          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {t('vocal_separation.download_vocals') || '下载人声'}
                        </button>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                          <span>🎵</span>
                          {t('vocal_separation.instrumental') || '伴奏'}
                        </h4>
                        <audio 
                          controls 
                          src={instrumentalUrl} 
                          className="w-full mb-3"
                        />
                        <button
                          onClick={() => handleDownload('instrumental')}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {t('vocal_separation.download_instrumental') || '下载伴奏'}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-center pt-4">
                      <button
                        onClick={handleProcessAnother}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        {t('common.another') || '处理另一个'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {!file && (
            <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('vocal_separation.how_to_use_title') || '如何使用'}
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">1</div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {t('vocal_separation.how_to_use_step1') || '上传音频'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {t('vocal_separation.how_to_use_step1_desc') || '选择包含人声的音频文件'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">2</div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {t('vocal_separation.how_to_use_step2') || '开始分离'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {t('vocal_separation.how_to_use_step2_desc') || '点击"分离"按钮开始处理'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">3</div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {t('vocal_separation.how_to_use_step3') || '下载结果'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {t('vocal_separation.how_to_use_step3_desc') || '分别下载人声和伴奏文件'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!file && (
            <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('vocal_separation.faq_title') || '常见问题'}
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {t('vocal_separation.faq_q1') || '什么样的音频效果最好？'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {t('vocal_separation.faq_a1') || 'Studio recordings with clear vocals work best.'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {t('vocal_separation.faq_q2') || '会得到几个音轨？'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {t('vocal_separation.faq_a2') || 'You will typically get 2 tracks: vocals and instrumental.'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {t('vocal_separation.faq_q3') || '处理需要多长时间？'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {t('vocal_separation.faq_a3') || 'Processing takes 2-5 minutes.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

