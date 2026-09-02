'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef, useEffect, useCallback } from 'react'
import { removeBackground, preload } from '@imgly/background-removal'

export default function RemoveBackground() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState<'transparent' | 'white' | 'custom'>('transparent')
  const [customColor, setCustomColor] = useState('#ffffff')
  const [error, setError] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [processingStep, setProcessingStep] = useState('')
  const [isPreloading, setIsPreloading] = useState(true)
  const [isPreloaded, setIsPreloaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Preload assets on component mount
  useEffect(() => {
    const preloadAssets = async () => {
      setIsPreloading(true)
      try {
        await preload({
          progress: (key, current, total) => {
            if (total > 0) {
              const percent = Math.round((current / total) * 100)
              setDownloadProgress(percent)
              setProcessingStep(key)
            }
          },
        })
        setIsPreloaded(true)
        setIsPreloading(false)
        setDownloadProgress(100)
      } catch (err) {
        console.error('Preload error:', err)
        // Continue anyway - the library will download on demand
        setIsPreloading(false)
        setIsPreloaded(true)
      }
    }
    preloadAssets()
  }, [])

  const examples = [
    { image: '/image/background/1.jpg', title: t('remove_background.example_desc1') },
    { image: '/image/background/2.jpg', title: t('remove_background.example_desc2') },
    { image: '/image/background/3.jpg', title: t('remove_background.example_desc3') },
  ]

  const backgroundOptions = [
    { value: 'transparent', label: t('remove_background.bg_transparent') || 'Transparent', color: 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)' },
    { value: 'white', label: t('remove_background.bg_white') || 'White', color: '#ffffff' },
    { value: 'custom', label: t('remove_background.bg_custom') || 'Custom', color: customColor },
  ]

  const getFormatFromMimeType = (mimeType: string): string => {
    if (mimeType.includes('png')) return 'PNG'
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPEG'
    if (mimeType.includes('webp')) return 'WEBP'
    return 'Image'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectFile(e.target.files[0])
    }
  }

  const handleSelectFile = (selectedFile: File) => {
    setFile(selectedFile)
    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)
    setProcessedUrl(null)
    setError(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFile(e.dataTransfer.files[0])
    }
  }

  const handleClearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    if (processedUrl) {
      URL.revokeObjectURL(processedUrl)
    }
    setFile(null)
    setPreviewUrl(null)
    setProcessedUrl(null)
    setError(null)
  }

  const processImage = async () => {
    if (!file) return

    setIsProcessing(true)
    setError(null)
    setDownloadProgress(0)
    setProcessingStep('processing')

    try {
      const result = await removeBackground(file, {
        // Use smaller FP16 model for faster processing
        model: 'isnet_fp16',
        // Configure for faster processing
        device: 'cpu', // CPU is more reliable, GPU can be faster on supported devices
        // Progress callback
        progress: (key, current, total) => {
          if (total > 0) {
            const percent = Math.round((current / total) * 100)
            setDownloadProgress(percent)
            setProcessingStep(key)
          }
        },
        output: {
          format: 'image/png',
          quality: 1,
        },
      })

      const url = URL.createObjectURL(result)
      setProcessedUrl(url)
      setDownloadProgress(100)
    } catch (err: any) {
      console.error('Error processing image:', err)
      setError(err.message || t('remove_background.error_message') || 'An error occurred while processing the image.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processedUrl || !file) return

    const link = document.createElement('a')
    link.href = processedUrl
    const baseName = file.name.replace(/\.[^/.]+$/, '')
    link.download = baseName + '_no_background.png'
    link.click()
  }

  const handleProcessAnother = () => {
    handleClearFile()
  }

  const getResultStyle = () => {
    if (backgroundColor === 'transparent') {
      return { background: 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)', backgroundSize: '16px 16px', backgroundPosition: '0 0, 8px 8px' }
    } else if (backgroundColor === 'white') {
      return { background: '#ffffff' }
    } else {
      return { background: customColor }
    }
  }

  const getProgressText = () => {
    if (isPreloading) {
      if (processingStep === 'model' || processingStep === 'onnx') {
        return t('remove_background.downloading_model') || `Downloading AI model... ${downloadProgress}%`
      }
      return t('remove_background.preparing') || `Preparing... ${downloadProgress}%`
    }
    if (isProcessing) {
      if (processingStep === 'fetch' || processingStep === 'downloading') {
        return t('remove_background.downloading') || `Downloading... ${downloadProgress}%`
      }
      return t('remove_background.processing') || `Processing... ${downloadProgress}%`
    }
    return ''
  }

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('remove_background.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('remove_background.description')}
          </p>
        </div>

        {(isPreloading || downloadProgress < 100) && !file && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🤖</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t('remove_background.preparing_ai') || 'Preparing AI Model'}
              </h2>
              <p className="text-gray-600 mb-4">
                {t('remove_background.first_time_load') || 'Loading AI model for the first time (this only happens once)'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">{getProgressText()}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-xl p-8">
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
              onClick={() => isPreloaded && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
              />
              <div className={`cursor-pointer ${!isPreloaded ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="text-6xl mb-4">🪄</div>
                <p className="text-lg text-gray-700 mb-2">
                  {t('remove_background.upload_title')}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  {t('remove_background.click_to_upload')}
                </p>
                <p className="text-sm text-gray-400">
                  {t('remove_background.supported_formats')}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🖼️</div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t('remove_background.original_image') || 'Original Image'}
                  </p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-100">
                    <img
                      src={previewUrl || ''}
                      alt="Original"
                      className="w-full h-auto max-h-80 object-contain rounded"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t('remove_background.result') || 'Result'}
                  </p>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-2"
                    style={getResultStyle()}
                  >
                    {processedUrl ? (
                      <img
                        src={processedUrl}
                        alt="Processed"
                        className="w-full h-auto max-h-80 object-contain rounded"
                      />
                    ) : (
                      <div className="w-full h-80 flex items-center justify-center text-gray-400">
                        {t('remove_background.waiting_process') || 'Waiting for processing...'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {!processedUrl && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    {t('remove_background.select_bg') || 'Select Background Color'}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {backgroundOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setBackgroundColor(option.value as 'transparent' | 'white' | 'custom')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${backgroundColor === option.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        <span 
                          className="inline-block w-4 h-4 rounded border border-gray-300 mr-2 align-middle"
                          style={{ background: option.color }}
                        />
                        {option.label}
                      </button>
                    ))}
                    {backgroundColor === 'custom' && (
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                    )}
                  </div>
                </div>
              )}

              {!processedUrl && !isProcessing && (
                <button
                  onClick={processImage}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {t('remove_background.remove_bg')}
                </button>
              )}

              {isProcessing && (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-600">{getProgressText()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {processedUrl && (
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={handleDownload}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('remove_background.download') || t('common.download')}
                  </button>
                  <button
                    onClick={handleProcessAnother}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    {t('remove_background.process_another') || t('common.another')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('remove_background.features_title') || 'Key Features'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('remove_background.feature1') || 'AI-Powered'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('remove_background.feature1_desc') || 'Smart AI automatically detects and removes backgrounds'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('remove_background.feature2') || 'Fast Processing'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('remove_background.feature2_desc') || 'Get results in seconds, not minutes'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🎨</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('remove_background.feature3') || 'Custom Backgrounds'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('remove_background.feature3_desc') || 'Replace background with any color or transparency'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">📱</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('remove_background.feature4') || 'HD Quality'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('remove_background.feature4_desc') || 'Maintain original image quality'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('remove_background.how_to_use_title') || 'How to Use'}
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('remove_background.how_to_use_step1') || 'Upload Image'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('remove_background.how_to_use_step1_desc') || 'Select an image file to remove background'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">2</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('remove_background.how_to_use_step2') || 'Select Background'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('remove_background.how_to_use_step2_desc') || 'Choose transparent, white, or custom background'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">3</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('remove_background.how_to_use_step3') || 'Process'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('remove_background.how_to_use_step3_desc') || 'Click "Remove Background" to process'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">4</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('remove_background.how_to_use_step4') || 'Download Result'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('remove_background.how_to_use_step4_desc') || 'Download your image without background'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('remove_background.faq_title') || 'FAQ'}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">
                {t('remove_background.faq_q1')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('remove_background.faq_a1')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('remove_background.faq_q2')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('remove_background.faq_a2')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('remove_background.faq_q3')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('remove_background.faq_a3')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('remove_background.faq_q4')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('remove_background.faq_a4')}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            {t('remove_background.examples_title')}
          </h2>
          <p className="text-center text-gray-600 mb-12">
            {t('remove_background.examples_desc')}
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
