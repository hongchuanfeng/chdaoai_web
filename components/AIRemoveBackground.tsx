'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AIRemoveBackground() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const examples = [
    { image: '/image/background/1.jpg', title: t('ai_remove_background.example_desc1') },
    { image: '/image/background/2.jpg', title: t('ai_remove_background.example_desc2') },
    { image: '/image/background/3.jpg', title: t('ai_remove_background.example_desc3') },
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
    setProcessingProgress(0)
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
    setProcessingProgress(0)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const processImage = async () => {
    if (!file || !previewUrl) return

    if (!user) {
      setError(t('ai_remove_background.login_required') || 'Please login first')
      return
    }

    setIsProcessing(true)
    setProcessingProgress(0)
    setError(null)

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

      const response = await fetch('/api/remove-background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: previewUrl,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to remove background')
      }
      
      clearInterval(progressInterval)
      setProcessingProgress(100)
      setProcessedUrl(data.resultImage)
      setIsProcessing(false)

    } catch (err: any) {
      console.error('Error processing image:', err)
      setIsProcessing(false)
      setError(err.message || t('ai_remove_background.error_message') || 'An error occurred while processing the image.')
    }
  }

  const handleDownload = () => {
    if (!processedUrl || !file) return

    const link = document.createElement('a')
    link.href = processedUrl
    const baseName = file.name.replace(/\.[^/.]+$/, '')
    link.download = baseName + '_ai_background_removed.png'
    link.click()
  }

  const handleProcessAnother = () => {
    handleClearFile()
  }

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-full">
              {t('ai_remove_background.badge') || 'AI Powered'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('ai_remove_background.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('ai_remove_background.description')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition cursor-pointer ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-500'}`}
              onClick={() => fileInputRef.current?.click()}
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
              <div className="cursor-pointer">
                <div className="text-6xl mb-4">✨</div>
                <p className="text-lg text-gray-700 mb-2">
                  {t('ai_remove_background.upload_title')}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  {t('ai_remove_background.click_to_upload')}
                </p>
                <p className="text-sm text-gray-400">
                  {t('ai_remove_background.supported_formats')}
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
                    {t('ai_remove_background.original_image') || 'Original Image'}
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
                    {t('ai_remove_background.result') || 'Result'}
                  </p>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-2"
                    style={{ background: 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)', backgroundSize: '16px 16px', backgroundPosition: '0 0, 8px 8px' }}
                  >
                    {processedUrl ? (
                      <img
                        src={processedUrl}
                        alt="Processed"
                        className="w-full h-auto max-h-80 object-contain rounded"
                      />
                    ) : (
                      <div className="w-full h-80 flex items-center justify-center text-gray-400">
                        {t('ai_remove_background.waiting_process') || 'Waiting for processing...'}
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

              {!processedUrl && !isProcessing && (
                <button
                  onClick={processImage}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {t('ai_remove_background.remove_bg')} (1 {t('ai_remove_background.credits') || 'credit'})
                </button>
              )}

              {isProcessing && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <svg className="animate-spin h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-lg text-gray-700">
                      {t('ai_remove_background.processing')} {Math.round(processingProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {processedUrl && (
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={handleDownload}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('ai_remove_background.download') || t('common.download')}
                  </button>
                  <button
                    onClick={handleProcessAnother}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    {t('ai_remove_background.process_another') || t('common.another')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('ai_remove_background.features_title') || 'Key Features'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('ai_remove_background.feature1') || 'AI-Powered'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('ai_remove_background.feature1_desc') || 'Smart AI automatically detects and removes backgrounds'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('ai_remove_background.feature2') || 'Fast Processing'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('ai_remove_background.feature2_desc') || 'Get results in seconds, not minutes'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
              <span className="text-2xl">🎨</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('ai_remove_background.feature3') || 'HD Quality'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('ai_remove_background.feature3_desc') || 'Maintain original image quality'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
              <span className="text-2xl">📱</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('ai_remove_background.feature4') || 'Precise Edges'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('ai_remove_background.feature4_desc') || 'Preserve fine details like hair and fur'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('ai_remove_background.how_to_use_title') || 'How to Use'}
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('ai_remove_background.how_to_use_step1') || 'Upload Image'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('ai_remove_background.how_to_use_step1_desc') || 'Select an image file to remove background'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('ai_remove_background.how_to_use_step2') || 'AI Processing'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('ai_remove_background.how_to_use_step2_desc') || 'Our AI automatically detects and removes the background'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('ai_remove_background.how_to_use_step3') || 'Download Result'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('ai_remove_background.how_to_use_step3_desc') || 'Download your image with transparent background'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('ai_remove_background.faq_title') || 'FAQ'}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ai_remove_background.faq_q1')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ai_remove_background.faq_a1')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ai_remove_background.faq_q2')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ai_remove_background.faq_a2')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ai_remove_background.faq_q3')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ai_remove_background.faq_a3')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ai_remove_background.faq_q4')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ai_remove_background.faq_a4')}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            {t('ai_remove_background.examples_title')}
          </h2>
          <p className="text-center text-gray-600 mb-12">
            {t('ai_remove_background.examples_desc')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {examples.map((example, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                  src={example.image}
                  alt={example.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50">
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
