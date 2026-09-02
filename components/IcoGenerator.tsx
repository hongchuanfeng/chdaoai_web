'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

interface IcoOptions {
  size: number
  cornerRadius: number
}

const ICO_SIZES = [16, 32, 48, 64, 128, 256]
const CORNER_RADIUS_OPTIONS = [0, 2, 4, 6, 8, 10, 12, 16]

export default function IcoGenerator() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [processedImages, setProcessedImages] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [options, setOptions] = useState<IcoOptions>({
    size: 256,
    cornerRadius: 0
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setProcessedImages([])
      }
      reader.readAsDataURL(file)
    }
  }

  const generateIco = async (imageSrc: string, size: number, cornerRadius: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        canvas.width = size
        canvas.height = size

        // Create rounded rectangle path
        if (cornerRadius > 0) {
          const radius = (cornerRadius / 100) * size
          ctx.beginPath()
          ctx.moveTo(radius, 0)
          ctx.lineTo(size - radius, 0)
          ctx.quadraticCurveTo(size, 0, size, radius)
          ctx.lineTo(size, size - radius)
          ctx.quadraticCurveTo(size, size, size - radius, size)
          ctx.lineTo(radius, size)
          ctx.quadraticCurveTo(0, size, 0, size - radius)
          ctx.lineTo(0, radius)
          ctx.quadraticCurveTo(0, 0, radius, 0)
          ctx.closePath()
          ctx.clip()
        }

        // Draw image scaled to fit
        ctx.drawImage(img, 0, 0, size, size)

        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = imageSrc
    })
  }

  const handleProcess = async () => {
    if (!selectedImage) return
    setIsProcessing(true)

    try {
      // Generate multiple sizes
      const sizes = options.size === 256 
        ? [16, 32, 48, 256] 
        : [options.size]
      
      const results = await Promise.all(
        sizes.map(size => generateIco(selectedImage, size, options.cornerRadius))
      )
      
      setProcessedImages(results)
    } catch (error) {
      console.error('ICO generation failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = (imageDataUrl: string, size: number) => {
    const link = document.createElement('a')
    link.download = `favicon-${size}x${size}.png`
    link.href = imageDataUrl
    link.click()
  }

  const handleDownloadAll = () => {
    processedImages.forEach((img, index) => {
      const sizes = options.size === 256 
        ? [16, 32, 48, 256] 
        : [options.size]
      setTimeout(() => {
        handleDownload(img, sizes[index])
      }, index * 100)
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('nav.ico_generator')}</h1>
        <p className="text-lg text-gray-600">{t('ico_generator.description')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        {!selectedImage ? (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-primary-500 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-lg text-gray-600">{t('ico_generator.upload')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('ico_generator.supported')}</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <img src={selectedImage} alt="Selected" className="max-w-full max-h-64 rounded-lg" />
            </div>

            {/* Size Selection */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium text-gray-700">{t('ico_generator.size')}</label>
              <div className="flex flex-wrap justify-center gap-2">
                {ICO_SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => setOptions(prev => ({ ...prev, size }))}
                    className={`px-4 py-2 rounded-lg border transition ${
                      options.size === size
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {size}x{size}
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Radius Selection */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium text-gray-700">{t('ico_generator.corner_radius') || 'Corner Radius'}</label>
              <div className="flex flex-wrap justify-center gap-2">
                {CORNER_RADIUS_OPTIONS.map(radius => (
                  <button
                    key={radius}
                    onClick={() => setOptions(prev => ({ ...prev, cornerRadius: radius }))}
                    className={`px-4 py-2 rounded-lg border transition ${
                      options.cornerRadius === radius
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {radius}%
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium text-gray-700">{t('ico_generator.preview') || 'Preview'}</label>
              <div 
                className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden"
                style={{ 
                  borderRadius: `${options.cornerRadius}%`,
                  maxWidth: `${options.size > 64 ? 64 : options.size}px`,
                  maxHeight: `${options.size > 64 ? 64 : options.size}px`
                }}
              >
                <img 
                  src={selectedImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  style={{ 
                    borderRadius: `${options.cornerRadius}%`
                  }}
                />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={() => { setSelectedImage(null); setProcessedImages([]); }} 
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                {t('common.clear')}
              </button>
              <button 
                onClick={handleProcess} 
                disabled={isProcessing} 
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {isProcessing ? t('ico_generator.processing') : t('ico_generator.generate')}
              </button>
            </div>
          </div>
        )}

        {processedImages.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t('ico_generator.result')}</h3>
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              {processedImages.map((img, index) => {
                const sizes = options.size === 256 ? [16, 32, 48, 256] : [options.size]
                const size = sizes[index]
                return (
                  <div key={size} className="flex flex-col items-center gap-2">
                    <div 
                      className="border border-gray-300 overflow-hidden"
                      style={{ 
                        borderRadius: `${options.cornerRadius}%`,
                        width: '64px',
                        height: '64px'
                      }}
                    >
                      <img src={img} alt={`${size}x${size}`} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm text-gray-600">{size}x{size}</span>
                    <button 
                      onClick={() => handleDownload(img, size)}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      {t('ico_generator.download')}
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-center">
              <button 
                onClick={handleDownloadAll}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                {t('ico_generator.download_all') || 'Download All'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
