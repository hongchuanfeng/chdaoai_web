'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

type MergeDirection = 'horizontal' | 'vertical'

export default function MergeImages() {
  const { t } = useLanguage()
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [mergeDirection, setMergeDirection] = useState<MergeDirection>('horizontal')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages: string[] = []
      let loadedCount = 0

      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          newImages.push(e.target?.result as string)
          loadedCount++
          if (loadedCount === files.length) {
            setSelectedImages(prev => [...prev, ...newImages])
            setProcessedImage(null)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setProcessedImage(null)
  }

  const handleProcess = async () => {
    if (selectedImages.length < 2) return

    setIsProcessing(true)

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        setIsProcessing(false)
        return
      }

      const images = await Promise.all(
        selectedImages.map(src => {
          return new Promise<HTMLImageElement>((resolve) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.src = src
          })
        })
      )

      if (mergeDirection === 'horizontal') {
        const totalWidth = images.reduce((sum, img) => sum + img.width, 0)
        const maxHeight = Math.max(...images.map(img => img.height))

        canvas.width = totalWidth
        canvas.height = maxHeight

        let xOffset = 0
        images.forEach(img => {
          ctx.drawImage(img, xOffset, 0)
          xOffset += img.width
        })
      } else {
        const maxWidth = Math.max(...images.map(img => img.width))
        const totalHeight = images.reduce((sum, img) => sum + img.height, 0)

        canvas.width = maxWidth
        canvas.height = totalHeight

        let yOffset = 0
        images.forEach(img => {
          ctx.drawImage(img, 0, yOffset)
          yOffset += img.height
        })
      }

      const mergedDataUrl = canvas.toDataURL('image/png')
      setProcessedImage(mergedDataUrl)
    } catch (error) {
      console.error('Error merging images:', error)
    }

    setIsProcessing(false)
  }

  const handleClear = () => {
    setSelectedImages([])
    setProcessedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDownload = () => {
    if (!processedImage) return
    const link = document.createElement('a')
    link.download = 'merged-image.png'
    link.href = processedImage
    link.click()
  }

  const handleProcessAnother = () => {
    setProcessedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('nav.merge_images')}</h1>
        <p className="text-lg text-gray-600">{t('merge_images.description')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition mb-6"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-lg text-gray-600">{t('merge_images.upload_multiple')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('merge_images.supported')}</p>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
        </div>

        {selectedImages.length > 0 && !processedImage && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <p className="text-gray-700 font-medium">{selectedImages.length} {t('merge_images.images_selected')}</p>
              <button onClick={handleClear} className="text-sm text-red-600 hover:text-red-700">
                {t('common.clear')}
              </button>
            </div>

            {/* 合并方向选择 */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">{t('merge_images.direction') || '合并方向'}</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setMergeDirection('horizontal')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                    mergeDirection === 'horizontal'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <span className="text-sm font-medium">{t('merge_images.horizontal') || '横向'}</span>
                </button>
                <button
                  onClick={() => setMergeDirection('vertical')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                    mergeDirection === 'vertical'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-sm font-medium">{t('merge_images.vertical') || '纵向'}</span>
                </button>
              </div>
            </div>

            {/* 图片预览 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {selectedImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img} alt={`Selected ${idx}`} className="w-full h-20 object-cover rounded" />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                    {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!processedImage && (
          <div className="flex justify-center">
            <button 
              onClick={handleProcess} 
              disabled={isProcessing || selectedImages.length < 2} 
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing && (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isProcessing ? t('merge_images.processing') : t('merge_images.merge')}
            </button>
          </div>
        )}

        {processedImage && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t('merge_images.result')}</h3>
            <div className="flex justify-center mb-6">
              <img src={processedImage} alt="Processed" className="max-w-full rounded-lg border" />
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={handleDownload} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t('merge_images.download')}
              </button>
              <button onClick={handleProcessAnother} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                {t('common.another')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('faq.title')}</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{t('merge_images.faq_q1')}</h3>
            <p className="text-gray-600 mt-1">{t('merge_images.faq_a1')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
