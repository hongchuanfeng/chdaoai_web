'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

export default function RotateImage() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rotation, setRotation] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const rotateImage = (imageSrc: string, angle: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        // Convert angle to radians
        const radians = (angle * Math.PI) / 180
        const sin = Math.abs(Math.sin(radians))
        const cos = Math.abs(Math.cos(radians))

        // Calculate new canvas dimensions
        const newWidth = img.width * cos + img.height * sin
        const newHeight = img.width * sin + img.height * cos

        canvas.width = newWidth
        canvas.height = newHeight

        // Translate to center and rotate
        ctx.translate(newWidth / 2, newHeight / 2)
        ctx.rotate(radians)
        ctx.drawImage(img, -img.width / 2, -img.height / 2)

        const rotatedDataUrl = canvas.toDataURL('image/png')
        resolve(rotatedDataUrl)
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
        setRotation(0)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProcess = async () => {
    if (!selectedImage) return
    setIsProcessing(true)
    
    try {
      const rotated = await rotateImage(selectedImage, rotation)
      setProcessedImage(rotated)
    } catch (error) {
      console.error('Rotation failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processedImage) return
    const link = document.createElement('a')
    link.download = 'rotated-image.png'
    link.href = processedImage
    link.click()
  }

  const quickRotate = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('nav.rotate_image')}</h1>
        <p className="text-lg text-gray-600">{t('rotate_image.description')}</p>
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
            <p className="mt-4 text-lg text-gray-600">{t('rotate_image.upload')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('rotate_image.supported')}</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <img src={selectedImage} alt="Selected" className="max-w-full max-h-96 rounded-lg" style={{ transform: `rotate(${rotation}deg)` }} />
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => quickRotate(-90)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900">-90°</button>
              <button onClick={() => quickRotate(90)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900">+90°</button>
              <button onClick={() => quickRotate(180)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900">180°</button>
            </div>

            <div className="flex items-center justify-center gap-4">
              <label className="text-gray-700">{t('rotate_image.angle') || 'Angle'}:</label>
              <input 
                type="range" 
                min="0" 
                max="360" 
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-48"
              />
              <span className="text-gray-600">{rotation}°</span>
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={() => { setSelectedImage(null); setProcessedImage(null); setRotation(0); }} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                {t('common.clear')}
              </button>
              <button onClick={handleProcess} disabled={isProcessing} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50">
                {isProcessing ? t('rotate_image.processing') : t('rotate_image.apply')}
              </button>
            </div>
          </div>
        )}

        {processedImage && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t('rotate_image.result')}</h3>
            <div className="flex justify-center mb-6">
              <img src={processedImage} alt="Processed" className="max-w-full max-h-96 rounded-lg" />
            </div>
            <div className="flex justify-center">
              <button onClick={handleDownload} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                {t('rotate_image.download')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

