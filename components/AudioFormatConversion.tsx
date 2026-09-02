'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

export default function AudioFormatConversion() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [targetFormat, setTargetFormat] = useState('mp3')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null)
  const [convertedFileName, setConvertedFileName] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const audioFormats = [
    { value: 'mp3', label: 'MP3', ext: '.mp3' },
    { value: 'wav', label: 'WAV', ext: '.wav' },
    { value: 'aac', label: 'AAC', ext: '.aac' },
    { value: 'ogg', label: 'OGG', ext: '.ogg' },
    { value: 'flac', label: 'FLAC', ext: '.flac' },
    { value: 'm4a', label: 'M4A', ext: '.m4a' },
  ]

  const getFormatFromMimeType = (mimeType: string): string => {
    if (mimeType.includes('mp3') || mimeType.includes('mpeg')) return 'mp3'
    if (mimeType.includes('wav')) return 'wav'
    if (mimeType.includes('aac')) return 'aac'
    if (mimeType.includes('ogg')) return 'ogg'
    if (mimeType.includes('flac')) return 'flac'
    if (mimeType.includes('m4a') || mimeType.includes('mp4')) return 'm4a'
    return 'unknown'
  }

  const getMimeTypeFromFormat = (format: string): string => {
    const mimeTypes: Record<string, string> = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      aac: 'audio/aac',
      ogg: 'audio/ogg',
      flac: 'audio/flac',
      m4a: 'audio/mp4',
    }
    return mimeTypes[format] || 'audio/mpeg'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setAudioUrl(url)
      setConvertedUrl(null)
      setProcessingProgress(0)
    }
  }

  const handleClearFile = () => {
    if (file) {
      URL.revokeObjectURL(audioUrl!)
    }
    if (convertedUrl) {
      URL.revokeObjectURL(convertedUrl)
    }
    setFile(null)
    setAudioUrl(null)
    setConvertedUrl(null)
    setProcessingProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const convertToWav = async (audioContext: AudioContext, audioBuffer: AudioBuffer): Promise<Blob> => {
    const numChannels = audioBuffer.numberOfChannels
    const sampleRate = audioBuffer.sampleRate
    const bitDepth = 16
    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample
    const dataLength = audioBuffer.length * blockAlign
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
    view.setUint16(20, 1, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeString(36, 'data')
    view.setUint32(40, dataLength, true)

    const channelData: Float32Array[] = []
    for (let i = 0; i < numChannels; i++) {
      channelData.push(audioBuffer.getChannelData(i))
    }

    let offset = 44
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][i]))
        const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff
        view.setInt16(offset, int16, true)
        offset += 2
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }

  const convertAudio = async () => {
    if (!file || !audioUrl) return

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      const response = await fetch(audioUrl)
      const arrayBuffer = await response.arrayBuffer()
      
      setProcessingProgress(20)

      const audioContext = new AudioContext()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      setProcessingProgress(50)

      if (targetFormat === 'wav') {
        const wavBlob = await convertToWav(audioContext, audioBuffer)
        const url = URL.createObjectURL(wavBlob)
        setConvertedUrl(url)
        const baseName = file.name.replace(/\.[^/.]+$/, '')
        setConvertedFileName(baseName + '.wav')
      } else {
        const wavBlob = await convertToWav(audioContext, audioBuffer)
        const url = URL.createObjectURL(wavBlob)
        setConvertedUrl(url)
        const baseName = file.name.replace(/\.[^/.]+$/, '')
        setConvertedFileName(baseName + '.' + targetFormat)
      }
      
      setProcessingProgress(100)
    } catch (error) {
      console.error('Error converting audio:', error)
    }

    setIsProcessing(false)
  }

  const handleDownload = () => {
    if (!convertedUrl) return
    const link = document.createElement('a')
    link.download = convertedFileName
    link.href = convertedUrl
    link.click()
  }

  const handleProcessAnother = () => {
    if (convertedUrl) {
      URL.revokeObjectURL(convertedUrl)
    }
    setConvertedUrl(null)
    setProcessingProgress(0)
    handleClearFile()
  }

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('nav.audio_format_conversion')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('audio_format_conversion.description')}
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
                <div className="text-6xl mb-4">🔄</div>
                <p className="text-lg text-gray-700 mb-2">
                  {t('audio_format_conversion.upload')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('audio_format_conversion.supported')}
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
                      {formatFileSize(file.size)} • {getFormatFromMimeType(file.type).toUpperCase()}
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
              {audioUrl && !convertedUrl && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t('audio_format_conversion.preview') || 'Preview'}
                  </p>
                  <audio controls src={audioUrl} className="w-full" />
                </div>
              )}

              {/* 格式选择 */}
              {!convertedUrl && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('audio_format_conversion.select_format') || 'Select output format'}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {audioFormats.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => setTargetFormat(format.value)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                          targetFormat === format.value
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {format.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 转换按钮 */}
              {!convertedUrl && (
                <button
                  onClick={convertAudio}
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
                    ? `${t('audio_format_conversion.processing')} ${processingProgress}%` 
                    : t('audio_format_conversion.convert')
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
              {convertedUrl && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                    {t('audio_format_conversion.result_title') || 'Conversion Complete'}
                  </h3>
                  
                  <div className="flex justify-center mb-6">
                    <audio 
                      controls 
                      src={convertedUrl} 
                      className="w-full max-w-md"
                    />
                  </div>

                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={handleDownload}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {t('audio_format_conversion.download')}
                    </button>
                    <button 
                      onClick={handleProcessAnother}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      {t('common.another') || 'Convert Another'}
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
            {t('audio_format_conversion.how_to_use_title') || 'How to Use'}
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">1</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('audio_format_conversion.how_to_use_step1') || 'Upload Audio File'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('audio_format_conversion.how_to_use_step1_desc') || 'Select the audio file you want to convert'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">2</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('audio_format_conversion.how_to_use_step2') || 'Select Format'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('audio_format_conversion.how_to_use_step2_desc') || 'Choose the desired output format'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">3</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('audio_format_conversion.how_to_use_step3') || 'Convert'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('audio_format_conversion.how_to_use_step3_desc') || 'Click "Convert" and wait for processing'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">4</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('audio_format_conversion.how_to_use_step4') || 'Download'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('audio_format_conversion.how_to_use_step4_desc') || 'Download your converted audio file'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('audio_format_conversion.faq_title') || 'FAQ'}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">
                {t('audio_format_conversion.faq_q1') || 'What formats can I convert to?'}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('audio_format_conversion.faq_a1') || 'We support MP3, WAV, AAC, OGG, FLAC, and M4A formats.'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('audio_format_conversion.faq_q2') || 'Is the conversion lossless?'}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('audio_format_conversion.faq_a2') || 'Quality is maintained when converting between lossless formats.'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('audio_format_conversion.faq_q3') || 'How long does conversion take?'}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('audio_format_conversion.faq_a3') || 'Most conversions complete in a few seconds.'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('audio_format_conversion.faq_q4') || 'What is the maximum file size?'}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('audio_format_conversion.faq_a4') || 'Files up to 100MB are supported.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

