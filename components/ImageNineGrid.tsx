'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

export default function ImageNineGrid() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [processedImages, setProcessedImages] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [originalDimensions, setOriginalDimensions] = useState<{width: number, height: number} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setOriginalFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setSelectedImage(result)
        setProcessedImages([])
        
        const img = new Image()
        img.onload = () => {
          setOriginalDimensions({ width: img.width, height: img.height })
        }
        img.src = result
      }
      reader.readAsDataURL(file)
    }
  }

  const splitIntoNineGrid = async () => {
    if (!selectedImage) return
    
    setIsProcessing(true)
    setProcessedImages([])
    
    try {
      const img = new Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
        img.src = selectedImage
      })
      
      const { width, height } = img
      const cellWidth = Math.floor(width / 3)
      const cellHeight = Math.floor(height / 3)
      
      const images: string[] = []
      
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const canvas = document.createElement('canvas')
          canvas.width = cellWidth
          canvas.height = cellHeight
          
          const ctx = canvas.getContext('2d')
          if (!ctx) continue
          
          const sx = col * cellWidth
          const sy = row * cellHeight
          
          ctx.drawImage(img, sx, sy, cellWidth, cellHeight, 0, 0, cellWidth, cellHeight)
          
          images.push(canvas.toDataURL('image/png'))
        }
      }
      
      setProcessedImages(images)
    } catch (error) {
      console.error('Failed to split image:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadSingleImage = (index: number, dataUrl: string) => {
    const link = document.createElement('a')
    link.download = `nine-grid-${index + 1}.png`
    link.href = dataUrl
    link.click()
  }

  const downloadAllImages = () => {
    processedImages.forEach((dataUrl, index) => {
      setTimeout(() => {
        downloadSingleImage(index, dataUrl)
      }, index * 200)
    })
  }

  const clearAll = () => {
    setSelectedImage(null)
    setOriginalFile(null)
    setProcessedImages([])
    setOriginalDimensions(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('nav.image_nine_grid')}</h1>
        <p className="text-lg text-gray-600">{t('image_nine_grid.description')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        {!selectedImage ? (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-primary-500 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-lg text-gray-600 font-medium">{t('image_nine_grid.upload')}</p>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
            <p className="mt-2 text-sm text-gray-500">{t('image_nine_grid.supported')}</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-gray-600 font-medium">{t('image_nine_grid.original_image')}</p>
                {originalDimensions && (
                  <p className="text-sm text-gray-500">{originalDimensions.width} × {originalDimensions.height}px</p>
                )}
              </div>
              <button
                onClick={clearAll}
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                {t('common.clear')}
              </button>
            </div>
            
            <div className="flex justify-center mb-8">
              <img 
                src={selectedImage} 
                alt="Selected" 
                className="max-w-full max-h-[400px] rounded-lg shadow-md object-contain" 
              />
            </div>

            {processedImages.length === 0 && (
              <div className="flex justify-center">
                <button
                  onClick={splitIntoNineGrid}
                  disabled={isProcessing}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 font-medium text-lg"
                >
                  {isProcessing ? t('image_nine_grid.processing') : t('image_nine_grid.split_button')}
                </button>
              </div>
            )}
          </div>
        )}

        {processedImages.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('image_nine_grid.result')}</h3>
              <button
                onClick={downloadAllImages}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                {t('image_nine_grid.download_all')}
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {processedImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img 
                    src={img} 
                    alt={`Grid ${idx + 1}`} 
                    className="w-full aspect-square object-cover rounded-lg shadow-md" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => downloadSingleImage(idx, img)}
                      className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition"
                    >
                      {t('image_nine_grid.download')}
                    </button>
                  </div>
                  <span className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {idx + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-2">{t('image_nine_grid.tip')}</p>
              <button
                onClick={() => setProcessedImages([])}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {t('image_nine_grid.retry')}
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{t('image_nine_grid.how_it_works')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 font-bold text-lg">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{t('image_nine_grid.step1_title')}</h4>
              <p className="text-sm text-gray-600">{t('image_nine_grid.step1_desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 font-bold text-lg">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{t('image_nine_grid.step2_title')}</h4>
              <p className="text-sm text-gray-600">{t('image_nine_grid.step2_desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 font-bold text-lg">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{t('image_nine_grid.step3_title')}</h4>
              <p className="text-sm text-gray-600">{t('image_nine_grid.step3_desc')}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{t('image_nine_grid.features_title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">⚡</span>
              <div>
                <h4 className="font-semibold text-gray-900">{t('image_nine_grid.feature1')}</h4>
                <p className="text-sm text-gray-600">{t('image_nine_grid.feature1_desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">📱</span>
              <div>
                <h4 className="font-semibold text-gray-900">{t('image_nine_grid.feature2')}</h4>
                <p className="text-sm text-gray-600">{t('image_nine_grid.feature2_desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🆓</span>
              <div>
                <h4 className="font-semibold text-gray-900">{t('image_nine_grid.feature3')}</h4>
                <p className="text-sm text-gray-600">{t('image_nine_grid.feature3_desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🔒</span>
              <div>
                <h4 className="font-semibold text-gray-900">{t('image_nine_grid.feature4')}</h4>
                <p className="text-sm text-gray-600">{t('image_nine_grid.feature4_desc')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{t('image_nine_grid.faq_title')}</h3>
          <div className="space-y-4">
            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-black">
                <span>{t('image_nine_grid.faq_q1')}</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="m6 9 6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-2 p-3">{t('image_nine_grid.faq_a1')}</p>
            </details>
            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-black">
                <span>{t('image_nine_grid.faq_q2')}</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="m6 9 6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-2 p-3">{t('image_nine_grid.faq_a2')}</p>
            </details>
            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-black">
                <span>{t('image_nine_grid.faq_q3')}</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="m6 9 6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-2 p-3">{t('image_nine_grid.faq_a3')}</p>
            </details>
            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-black">
                <span>{t('image_nine_grid.faq_q4')}</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="m6 9 6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-2 p-3">{t('image_nine_grid.faq_a4')}</p>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
