'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

export default function AudioRepair() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [repairedAudioUrl, setRepairedAudioUrl] = useState<string | null>(null)
  const [repairOptions, setRepairOptions] = useState({
    noiseReduction: true,
    clickRemoval: true,
    audioEnhancement: true,
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRepairing, setIsRepairing] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setAudioUrl(url)
      setRepairedAudioUrl(null)
      setProgress(0)
      setIsRepairing(false)
    }
  }

  const handleRemoveFile = () => {
    if (file && audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    if (repairedAudioUrl) {
      URL.revokeObjectURL(repairedAudioUrl)
    }
    setFile(null)
    setAudioUrl(null)
    setRepairedAudioUrl(null)
    setProgress(0)
    setIsPlaying(false)
    setIsRepairing(false)
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

  const applyNoiseReduction = (channelData: Float32Array<ArrayBufferLike>, sampleRate: number): Float32Array<ArrayBufferLike> => {
    const windowSize = 2048
    const noiseThreshold = 0.02
    const result = new Float32Array(channelData.length)

    for (let i = 0; i < channelData.length; i++) {
      let windowEnergy = 0
      const start = Math.max(0, i - windowSize / 2)
      const end = Math.min(channelData.length, i + windowSize / 2)

      for (let j = start; j < end; j++) {
        windowEnergy += channelData[j] * channelData[j]
      }
      windowEnergy = Math.sqrt(windowEnergy / (end - start))

      if (windowEnergy < noiseThreshold) {
        result[i] = channelData[i] * 0.3
      } else {
        const reductionFactor = Math.min(1, (windowEnergy - noiseThreshold) / (0.1 - noiseThreshold))
        result[i] = channelData[i] * (0.7 + 0.3 * reductionFactor)
      }
    }

    return result
  }

  const applyClickRemoval = (channelData: Float32Array<ArrayBufferLike>, sampleRate: number): Float32Array<ArrayBufferLike> => {
    const result = new Float32Array(channelData.length)
    const windowSize = 51

    for (let i = 0; i < channelData.length; i++) {
      result[i] = channelData[i]
    }

    for (let i = windowSize; i < channelData.length - windowSize; i++) {
      let localMean = 0
      for (let j = -windowSize / 2; j < windowSize / 2; j++) {
        localMean += channelData[i + j]
      }
      localMean /= windowSize

      let localStd = 0
      for (let j = -windowSize / 2; j < windowSize / 2; j++) {
        localStd += Math.pow(channelData[i + j] - localMean, 2)
      }
      localStd = Math.sqrt(localStd / windowSize)

      if (Math.abs(channelData[i] - localMean) > 3 * localStd && localStd > 0.001) {
        result[i] = localMean
      }
    }

    return result
  }

  const applyAudioEnhancement = (channelData: Float32Array<ArrayBufferLike>, sampleRate: number): Float32Array<ArrayBufferLike> => {
    const result = new Float32Array(channelData.length)

    let maxSample = 0
    for (let i = 0; i < channelData.length; i++) {
      maxSample = Math.max(maxSample, Math.abs(channelData[i]))
    }

    const targetPeak = 0.95
    const gainFactor = maxSample > 0 ? targetPeak / maxSample : 1

    for (let i = 0; i < channelData.length; i++) {
      let enhanced = channelData[i] * gainFactor * 0.8

      const trebleBoost = 1 + 0.2 * Math.sin(i / (sampleRate * 0.01))
      enhanced *= trebleBoost

      result[i] = Math.max(-1, Math.min(1, enhanced))
    }

    return result
  }

  const handleRepair = async () => {
    if (!audioUrl) return

    setProcessing(true)
    setIsRepairing(true)
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

      const repairedBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate)

      for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel)
        let processedData = new Float32Array(channelData) as Float32Array

        if (repairOptions.noiseReduction) {
          setProgress(60 + channel * 10)
          processedData = applyNoiseReduction(processedData, sampleRate)
        }

        if (repairOptions.clickRemoval) {
          setProgress(70 + channel * 10)
          processedData = applyClickRemoval(processedData, sampleRate)
        }

        if (repairOptions.audioEnhancement) {
          setProgress(80 + channel * 10)
          processedData = applyAudioEnhancement(processedData, sampleRate)
        }

        const outputData = repairedBuffer.getChannelData(channel)
        outputData.set(processedData)
      }

      setProgress(90)

      const wavBlob = audioBufferToWav(repairedBuffer)
      const repairedUrl = URL.createObjectURL(wavBlob)
      setRepairedAudioUrl(repairedUrl)

      setProgress(100)
    } catch (error) {
      console.error('Error repairing audio:', error)
    }

    setProcessing(false)
    setIsRepairing(false)
  }

  const handlePlay = (track: 'original' | 'repaired') => {
    if (audioRef.current) {
      audioRef.current.pause()
    }

    let url: string | null = null
    if (track === 'original') url = audioUrl
    else if (track === 'repaired') url = repairedAudioUrl

    if (url && audioRef.current) {
      audioRef.current.src = url
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleDownload = () => {
    if (!repairedAudioUrl) return

    const link = document.createElement('a')
    link.download = 'repaired-audio.wav'
    link.href = repairedAudioUrl
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

  const toggleOption = (option: keyof typeof repairOptions) => {
    setRepairOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }

  return (
    <>
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('nav.audio_repair')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('audio_repair.description')}
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
                  <div className="text-6xl mb-4">🔧</div>
                  <p className="text-lg text-gray-700 mb-2">
                    {t('audio_repair.upload')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('audio_repair.supported')}
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

                {/* Repair Options */}
                {!repairedAudioUrl && !processing && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {t('audio_repair.repair_options') || '修复选项'}
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <label className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition border-2 ${repairOptions.noiseReduction ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="checkbox"
                          checked={repairOptions.noiseReduction}
                          onChange={() => toggleOption('noiseReduction')}
                          className="sr-only"
                        />
                        <div className="text-3xl mb-2">🔊</div>
                        <span className="text-sm font-medium text-gray-900 text-center">
                          {t('audio_repair.noise_reduction') || '降噪'}
                        </span>
                        <span className="text-xs text-gray-500 text-center mt-1">
                          {t('audio_repair.noise_reduction_desc') || '移除背景噪音'}
                        </span>
                      </label>

                      <label className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition border-2 ${repairOptions.clickRemoval ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="checkbox"
                          checked={repairOptions.clickRemoval}
                          onChange={() => toggleOption('clickRemoval')}
                          className="sr-only"
                        />
                        <div className="text-3xl mb-2">👆</div>
                        <span className="text-sm font-medium text-gray-900 text-center">
                          {t('audio_repair.click_removal') || '去除点击'}
                        </span>
                        <span className="text-xs text-gray-500 text-center mt-1">
                          {t('audio_repair.click_removal_desc') || '移除噼啪声'}
                        </span>
                      </label>

                      <label className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition border-2 ${repairOptions.audioEnhancement ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="checkbox"
                          checked={repairOptions.audioEnhancement}
                          onChange={() => toggleOption('audioEnhancement')}
                          className="sr-only"
                        />
                        <div className="text-3xl mb-2">✨</div>
                        <span className="text-sm font-medium text-gray-900 text-center">
                          {t('audio_repair.enhancement') || '音频增强'}
                        </span>
                        <span className="text-xs text-gray-500 text-center mt-1">
                          {t('audio_repair.enhancement_desc') || '提升音质'}
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {audioUrl && !repairedAudioUrl && !processing && (
                  <button
                    onClick={handleRepair}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    {t('audio_repair.repair')}
                  </button>
                )}

                {processing && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{t('audio_repair.processing')}</span>
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

                {repairedAudioUrl && !processing && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('audio_repair.result_title') || '修复结果'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t('audio_repair.result_desc') || '音频已成功修复'}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <span>🎵</span>
                          {t('audio_repair.original') || '原始音频'}
                        </h4>
                        <audio
                          controls
                          src={audioUrl ?? undefined}
                          className="w-full mb-3"
                        />
                      </div>

                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                          <span>✨</span>
                          {t('audio_repair.repaired') || '修复后音频'}
                        </h4>
                        <audio
                          controls
                          src={repairedAudioUrl ?? undefined}
                          className="w-full mb-3"
                        />
                        <button
                          onClick={handleDownload}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {t('audio_repair.download') || '下载修复音频'}
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
                {t('audio_repair.how_to_use_title') || '如何使用'}
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">1</div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {t('audio_repair.how_to_use_step1') || '上传音频'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {t('audio_repair.how_to_use_step1_desc') || '选择需要修复的音频文件'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">2</div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {t('audio_repair.how_to_use_step2') || '选择修复选项'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {t('audio_repair.how_to_use_step2_desc') || '选择需要进行的修复类型'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">3</div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {t('audio_repair.how_to_use_step3') || '开始修复'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {t('audio_repair.how_to_use_step3_desc') || '点击"修复音频"按钮开始处理'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">4</div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {t('audio_repair.how_to_use_step4') || '下载结果'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {t('audio_repair.how_to_use_step4_desc') || '下载修复后的音频文件'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!file && (
            <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('audio_repair.faq_title') || '常见问题'}
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {t('audio_repair.faq_q1') || '可以修复哪些音频问题？'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {t('audio_repair.faq_a1') || '我们可以修复噪音、噼啪声、爆音、嗡嗡声等问题。'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {t('audio_repair.faq_q2') || '修复会影响音质吗？'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {t('audio_repair.faq_a2') || '我们的AI技术会将音质损失降到最低。'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {t('audio_repair.faq_q3') || '修复需要多长时间？'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {t('audio_repair.faq_a3') || '处理时间通常为2-5分钟。'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {t('audio_repair.faq_q4') || '可以预览后再下载吗？'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {t('audio_repair.faq_a4') || '是的，您可以先预览修复后的音频。'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {t('audio_repair.faq_q5') || '支持哪些格式？'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {t('audio_repair.faq_a5') || '支持MP3、WAV、AAC和FLAC格式。'}
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
