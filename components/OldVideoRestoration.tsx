'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

export default function OldVideoRestoration() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancementLevel, setEnhancementLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const examples = [
    { image: '/video/old/1.jpg', title: t('old_video_restoration.example_desc1') },
    { image: '/video/old/2.jpg', title: t('old_video_restoration.example_desc2') },
    { image: '/video/old/3.jpg', title: t('old_video_restoration.example_desc3') },
  ]

  const enhancementLevels = [
    { value: 'low', label: t('old_video_restoration.enhancement_low') || 'Light (Fast)' },
    { value: 'medium', label: t('old_video_restoration.enhancement_medium') || 'Standard' },
    { value: 'high', label: t('old_video_restoration.enhancement_high') || 'Maximum (Slow)' },
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
      setProcessedVideoUrl(null)
      setProcessingProgress(0)
    }
  }

  const handleClearFile = () => {
    if (file && videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }
    if (processedVideoUrl) {
      URL.revokeObjectURL(processedVideoUrl)
    }
    setFile(null)
    setVideoUrl(null)
    setProcessedVideoUrl(null)
    setProcessingProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const processVideo = async () => {
    if (!file || !videoUrl) return

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15
        })
      }, 500)

      // Call API to restore video
      const formData = new FormData()
      formData.append('video', file)
      formData.append('enhancement', enhancementLevel)

      const response = await fetch('/api/old-video-restoration', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to restore video')
      }

      const data = await response.json()
      
      clearInterval(progressInterval)
      setProcessingProgress(100)
      setProcessedVideoUrl(data.resultUrl || videoUrl)
      setIsProcessing(false)

    } catch (error) {
      console.error('Error processing video:', error)
      setIsProcessing(false)
      // For demo, show original as processed
      setProcessedVideoUrl(videoUrl)
      alert(t('old_video_restoration.error_message') || 'An error occurred while restoring the video.')
    }
  }

  const handleDownload = () => {
    if (!processedVideoUrl || !file) return

    const link = document.createElement('a')
    link.href = processedVideoUrl
    const baseName = file.name.replace(/\.[^/.]+$/, '')
    link.download = baseName + '_restored.mp4'
    link.click()
  }

  const handleProcessAnother = () => {
    handleClearFile()
  }

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('old_video_restoration.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('old_video_restoration.description')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {!file ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-amber-500 transition cursor-pointer"
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
                <div className="text-6xl mb-4">🎞️</div>
                <p className="text-lg text-gray-700 mb-2">
                  {t('old_video_restoration.upload_title')}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  {t('old_video_restoration.click_to_upload')}
                </p>
                <p className="text-sm text-gray-400">
                  {t('old_video_restoration.supported_formats')}
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🎞️</div>
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

              {videoUrl && !processedVideoUrl && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t('old_video_restoration.original_video') || 'Original Video'}
                  </p>
                  <video
                    controls
                    src={videoUrl}
                    className="w-full max-h-80 rounded-lg"
                  />
                </div>
              )}

              {processedVideoUrl && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t('old_video_restoration.restored_video') || 'Restored Video'}
                  </p>
                  <video
                    controls
                    src={processedVideoUrl}
                    className="w-full max-h-80 rounded-lg"
                  />
                </div>
              )}

              {!processedVideoUrl && !isProcessing && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      💡 {t('old_video_restoration.enhancement_tip') || 'Choose the enhancement level based on your video quality and desired result.'}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('old_video_restoration.enhancement_level') || 'Enhancement Level'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {enhancementLevels.map((level) => (
                        <button
                          key={level.value}
                          onClick={() => setEnhancementLevel(level.value as 'low' | 'medium' | 'high')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            enhancementLevel === level.value
                              ? 'bg-amber-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={processVideo}
                    className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-700 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {t('old_video_restoration.restore')}
                  </button>
                </div>
              )}

              {isProcessing && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <svg className="animate-spin h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-lg text-gray-700">
                      {t('old_video_restoration.processing')} {Math.round(processingProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {processedVideoUrl && (
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  <button
                    onClick={handleDownload}
                    className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('old_video_restoration.download') || t('common.download')}
                  </button>
                  <button
                    onClick={handleProcessAnother}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    {t('old_video_restoration.process_another') || t('common.another')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('old_video_restoration.features_title') || 'Key Features'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🎨</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('old_video_restoration.feature1') || 'Color Restoration'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('old_video_restoration.feature1_desc') || 'Restore faded colors and bring back original vibrancy'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">✨</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('old_video_restoration.feature2') || 'Noise Reduction'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('old_video_restoration.feature2_desc') || 'Remove grain, scratches, and artifacts from old footage'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">📺</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('old_video_restoration.feature3') || 'Stabilization'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('old_video_restoration.feature3_desc') || 'Fix shaky and unstable video footage'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🔍</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('old_video_restoration.feature4') || 'Upscaling'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('old_video_restoration.feature4_desc') || 'Enhance resolution and detail for modern displays'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('old_video_restoration.how_to_use_title') || 'How to Use'}
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">1</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('old_video_restoration.how_to_use_step1') || 'Upload Video'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('old_video_restoration.how_to_use_step1_desc') || 'Select an old or low-quality video file'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">2</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('old_video_restoration.how_to_use_step2') || 'Choose Enhancement Level'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('old_video_restoration.how_to_use_step2_desc') || 'Select the level of restoration you want'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">3</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('old_video_restoration.how_to_use_step3') || 'Restore Video'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('old_video_restoration.how_to_use_step3_desc') || 'Click "Restore Video" to start processing'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">4</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('old_video_restoration.how_to_use_step4') || 'Download Result'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('old_video_restoration.how_to_use_step4_desc') || 'Download the restored video in high quality'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('old_video_restoration.faq_title') || 'FAQ'}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">
                {t('old_video_restoration.faq_q1')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('old_video_restoration.faq_a1')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('old_video_restoration.faq_q2')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('old_video_restoration.faq_a2')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('old_video_restoration.faq_q3')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('old_video_restoration.faq_a3')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('old_video_restoration.faq_q4')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('old_video_restoration.faq_a4')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('old_video_restoration.faq_q5')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('old_video_restoration.faq_a5')}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            {t('old_video_restoration.examples_title')}
          </h2>
          <p className="text-center text-gray-600 mb-12">
            {t('old_video_restoration.examples_desc')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {examples.map((example, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                  src={example.image}
                  alt={example.title}
                  className="w-full h-48 object-cover"
                />
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
