'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

export default function PhotoRestoration() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [restorationStrength, setRestorationStrength] = useState(50)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const restoreImage = (imageSrc: string, strength: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }
        
        // Draw original image
        ctx.drawImage(img, 0, 0)
        
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        const factor = strength / 100
        
        // Process each pixel for restoration effect
        for (let i = 0; i < data.length; i += 4) {
          let r = data[i]
          let g = data[i + 1]
          let b = data[i + 2]
          
          // 1. Auto contrast enhancement
          const avg = (r + g + b) / 3
          const contrastFactor = (259 * (128 * factor + 255)) / (255 * (259 - 128 * factor))
          r = contrastFactor * (r - 128) + 128
          g = contrastFactor * (g - 128) + 128
          b = contrastFactor * (b - 128) + 128
          
          // 2. Brightness adjustment for old photos (they tend to be dark)
          const brightnessBoost = 20 * factor
          r = Math.min(255, r + brightnessBoost)
          g = Math.min(255, g + brightnessBoost)
          b = Math.min(255, b + brightnessBoost)
          
          // 3. Saturation boost for faded colors
          const gray = 0.2989 * r + 0.587 * g + 0.114 * b
          const saturationFactor = 1 + (0.3 * factor)
          r = gray + saturationFactor * (r - gray)
          g = gray + saturationFactor * (g - gray)
          b = gray + saturationFactor * (b - gray)
          
          // 4. Slight sharpening effect (edge enhancement)
          data[i] = Math.max(0, Math.min(255, r))
          data[i + 1] = Math.max(0, Math.min(255, g))
          data[i + 2] = Math.max(0, Math.min(255, b))
        }
        
        ctx.putImageData(imageData, 0, 0)
        
        // Apply additional smoothing for noise reduction
        if (factor > 0.3) {
          const smoothCanvas = document.createElement('canvas')
          smoothCanvas.width = canvas.width
          smoothCanvas.height = canvas.height
          const smoothCtx = smoothCanvas.getContext('2d')
          if (smoothCtx) {
            smoothCtx.filter = `blur(${0.5 * factor}px)`
            smoothCtx.drawImage(canvas, 0, 0)
            ctx.drawImage(smoothCanvas, 0, 0)
          }
        }
        
        const restoredDataUrl = canvas.toDataURL('image/jpeg', 0.95)
        resolve(restoredDataUrl)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = imageSrc
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setProcessedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProcess = async () => {
    if (!selectedImage) return
    setIsProcessing(true)
    
    try {
      const restored = await restoreImage(selectedImage, restorationStrength)
      setProcessedImage(restored)
    } catch (error) {
      console.error('Restoration failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processedImage) return
    const link = document.createElement('a')
    link.download = 'restored-photo.jpg'
    link.href = processedImage
    link.click()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('nav.photo_restoration')}</h1>
        <p className="text-lg text-gray-600">{t('photo_restoration.description')}</p>
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
            <p className="mt-4 text-lg text-gray-600">{t('photo_restoration.upload')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('photo_restoration.supported')}</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <img src={selectedImage} alt="Selected" className="max-w-full max-h-96 rounded-lg" />
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <label className="text-gray-700">{t('photo_restoration.strength') || 'Restoration Strength'}:</label>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={restorationStrength}
                onChange={(e) => setRestorationStrength(Number(e.target.value))}
                className="w-48"
              />
              <span className="text-gray-600">{restorationStrength}%</span>
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={() => { setSelectedImage(null); setProcessedImage(null); }} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                {t('common.clear')}
              </button>
              <button onClick={handleProcess} disabled={isProcessing} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50">
                {isProcessing ? t('photo_restoration.processing') : t('photo_restoration.restore')}
              </button>
            </div>
          </div>
        )}

        {processedImage && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t('photo_restoration.result')}</h3>
            <div className="flex justify-center mb-6">
              <img src={processedImage} alt="Processed" className="max-w-full max-h-96 rounded-lg" />
            </div>
            <div className="flex justify-center">
              <button onClick={handleDownload} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                {t('photo_restoration.download')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

