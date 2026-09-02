'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

export default function AudioClipMerge() {
  const { t } = useLanguage()
  const [audioFiles, setAudioFiles] = useState<{ file: File; url: string }[]>([])
  const [mergedAudioUrl, setMergedAudioUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newAudios: { file: File; url: string }[] = []

      Array.from(files).forEach(file => {
        if (file.type.startsWith('audio/')) {
          const url = URL.createObjectURL(file)
          newAudios.push({ file, url })
        }
      })

      if (newAudios.length > 0) {
        setAudioFiles(prev => [...prev, ...newAudios])
        setMergedAudioUrl(null)
      }
    }
  }

  const handleRemoveAudio = (index: number) => {
    setAudioFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].url)
      return newFiles.filter((_, i) => i !== index)
    })
    setMergedAudioUrl(null)
  }

  const handleClearAll = () => {
    audioFiles.forEach(audio => URL.revokeObjectURL(audio.url))
    if (mergedAudioUrl) {
      URL.revokeObjectURL(mergedAudioUrl)
    }
    setAudioFiles([])
    setMergedAudioUrl(null)
  }

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return

    const newFiles = [...audioFiles]
    const draggedItem = newFiles[dragIndex]
    newFiles.splice(dragIndex, 1)
    newFiles.splice(index, 0, draggedItem)
    setAudioFiles(newFiles)
    setDragIndex(index)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
  }

  const handleMerge = async () => {
    if (audioFiles.length < 2) return

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      const audioContext = new AudioContext()
      const audioBuffers: AudioBuffer[] = []

      for (let i = 0; i < audioFiles.length; i++) {
        const response = await fetch(audioFiles[i].url)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        audioBuffers.push(audioBuffer)
        setProcessingProgress(Math.round(((i + 1) / audioFiles.length) * 50))
      }

      const totalLength = audioBuffers.reduce((sum, buffer) => sum + buffer.length, 0)
      const sampleRate = audioBuffers[0].sampleRate
      const numberOfChannels = Math.max(...audioBuffers.map(b => b.numberOfChannels))

      const mergedBuffer = audioContext.createBuffer(numberOfChannels, totalLength, sampleRate)

      let offset = 0
      for (const buffer of audioBuffers) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const channelData = mergedBuffer.getChannelData(channel)
          const sourceData = buffer.getChannelData(Math.min(channel, buffer.numberOfChannels - 1))
          channelData.set(sourceData, offset)
        }
        offset += buffer.length
      }

      setProcessingProgress(75)

      const wavBlob = audioBufferToWav(mergedBuffer)
      const url = URL.createObjectURL(wavBlob)
      setMergedAudioUrl(url)
      setProcessingProgress(100)
    } catch (error) {
      console.error('Error merging audio:', error)
    }

    setIsProcessing(false)
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

  const handleDownload = () => {
    if (!mergedAudioUrl) return
    const link = document.createElement('a')
    link.download = 'merged-audio.wav'
    link.href = mergedAudioUrl
    link.click()
  }

  const handleProcessAnother = () => {
    if (mergedAudioUrl) {
      URL.revokeObjectURL(mergedAudioUrl)
    }
    setMergedAudioUrl(null)
    handleClearAll()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('nav.audio_clip_merge')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('audio_clip_merge.description')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* 上传区域 */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition mb-6"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
              id="audio-upload"
              multiple
            />
            <div className="cursor-pointer">
              <div className="text-5xl mb-3">🎵</div>
              <p className="text-lg text-gray-700 mb-1">
                {t('audio_clip_merge.upload')}
              </p>
              <p className="text-sm text-gray-500">
                {t('audio_clip_merge.supported')}
              </p>
            </div>
          </div>

          {/* 音频文件列表 */}
          {audioFiles.length > 0 && !mergedAudioUrl && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <p className="text-gray-700 font-medium">
                  {audioFiles.length === 1 
                    ? t('audio_clip_merge.files_selected', { count: 1 })
                    : t('audio_clip_merge.files_selected_plural', { count: audioFiles.length })
                  }
                </p>
                <button 
                  onClick={handleClearAll} 
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  {t('common.clear') || 'Clear All'}
                </button>
              </div>

              <div className="space-y-2">
                {audioFiles.map((audio, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-move transition ${
                      dragIndex === index ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {audio.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(audio.file.size)}
                      </p>
                    </div>
                    <audio 
                      controls 
                      src={audio.url} 
                      className="h-8 w-32"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={() => handleRemoveAudio(index)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 合并按钮 */}
          {!mergedAudioUrl && (
            <div className="flex justify-center">
              <button 
                onClick={handleMerge}
                disabled={isProcessing || audioFiles.length < 2}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing && (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isProcessing 
                  ? `${t('audio_clip_merge.processing')} ${processingProgress}%` 
                  : t('audio_clip_merge.merge')
                }
              </button>
            </div>
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
          {mergedAudioUrl && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                {t('audio_clip_merge.result_title')}
              </h3>
              
              <div className="flex justify-center mb-6">
                <audio 
                  controls 
                  src={mergedAudioUrl} 
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
                  {t('audio_clip_merge.download')}
                </button>
                <button 
                  onClick={handleProcessAnother}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  {t('common.another') || 'Process Another'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('audio_clip_merge.how_to_use_title') || 'How to Use'}
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">1</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('audio_clip_merge.how_to_use_step1') || 'Upload Audio Clips'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('audio_clip_merge.how_to_use_step1_desc') || 'Select multiple audio files you want to merge'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">2</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('audio_clip_merge.how_to_use_step2') || 'Arrange Order'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('audio_clip_merge.how_to_use_step2_desc') || 'Drag and drop to arrange the order of clips'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">3</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('audio_clip_merge.how_to_use_step3') || 'Merge Audio'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('audio_clip_merge.how_to_use_step3_desc') || 'Click "Merge Audio" and wait for processing'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">4</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('audio_clip_merge.how_to_use_step4') || 'Download Result'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('audio_clip_merge.how_to_use_step4_desc') || 'Download your merged audio file'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('audio_clip_merge.faq_title') || 'FAQ'}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">
                {t('audio_clip_merge.faq_q1') || 'What audio formats are supported?'}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('audio_clip_merge.faq_a1') || 'We support MP3, WAV, AAC, and FLAC formats. You can mix different formats in one merge.'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('audio_clip_merge.faq_q2') || 'How many clips can I merge at once?'}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('audio_clip_merge.faq_a2') || 'You can merge up to 10 audio clips at once.'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('audio_clip_merge.faq_q3') || 'Will the audio quality be affected?'}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('audio_clip_merge.faq_a3') || 'Our tool maintains the original quality of each clip during the merge process.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

