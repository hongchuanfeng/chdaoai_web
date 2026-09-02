'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef, useEffect } from 'react'

interface ColorFilter {
  name: string
  color: string
}

const colorFilters: ColorFilter[] = [
  { name: '复古棕', color: '#8B4513' },
  { name: '蓝色', color: '#4169E1' },
  { name: '绿色', color: '#228B22' },
  { name: '紫色', color: '#9370DB' },
  { name: '粉色', color: '#FF69B4' },
  { name: '橙色', color: '#FF8C00' },
  { name: '红色', color: '#DC143C' },
  { name: '青色', color: '#00CED1' },
  { name: '金黄色', color: '#FFD700' },
  { name: '银灰色', color: '#A9A9A9' },
]

export default function ColorizeImage() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string>('#8B4513')
  const [intensity, setIntensity] = useState(50)
  const [displayScale, setDisplayScale] = useState(1)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [mode, setMode] = useState<'filter' | 'colorize'>('filter')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          setImageSize({ width: img.width, height: img.height })
        }
        img.src = e.target?.result as string
        setSelectedImage(e.target?.result as string)
        setProcessedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  // 计算预览图片的缩放比例
  useEffect(() => {
    if (imgRef.current && imageSize.width > 0) {
      const displayWidth = imgRef.current.clientWidth
      const displayHeight = imgRef.current.clientHeight
      const scaleX = displayWidth / imageSize.width
      const scaleY = displayHeight / imageSize.height
      setDisplayScale(Math.min(scaleX, scaleY))
    }
  }, [selectedImage, imageSize])

  // 实时预览
  useEffect(() => {
    if (!selectedImage || !previewCanvasRef.current) return

    const canvas = previewCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = selectedImage
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      if (mode === 'colorize') {
        // 上色模式 - 使用颜色混合
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        const hex = selectedColor.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        
        for (let i = 0; i < data.length; i += 4) {
          const gray = (data[i] + data[i + 1] + data[i + 2]) / 3
          const factor = intensity / 100
          data[i] = Math.round(gray * (1 - factor) + r * factor)
          data[i + 1] = Math.round(gray * (1 - factor) + g * factor)
          data[i + 2] = Math.round(gray * (1 - factor) + b * factor)
        }
        ctx.putImageData(imageData, 0, 0)
      } else {
        // 滤镜模式 - 叠加颜色
        ctx.globalCompositeOperation = 'overlay'
        ctx.globalAlpha = intensity / 100
        ctx.fillStyle = selectedColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
      }
    }
  }, [selectedImage, selectedColor, intensity, mode])

  const handleProcess = async () => {
    if (!selectedImage) return
    
    setIsProcessing(true)
    
    try {
      const img = new Image()
      img.src = selectedImage
      
      await new Promise((resolve) => {
        img.onload = resolve
      })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      if (mode === 'colorize') {
        // 上色模式
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        const hex = selectedColor.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        
        for (let i = 0; i < data.length; i += 4) {
          const gray = (data[i] + data[i + 1] + data[i + 2]) / 3
          const factor = intensity / 100
          data[i] = Math.round(gray * (1 - factor) + r * factor)
          data[i + 1] = Math.round(gray * (1 - factor) + g * factor)
          data[i + 2] = Math.round(gray * (1 - factor) + b * factor)
        }
        ctx.putImageData(imageData, 0, 0)
      } else {
        // 滤镜模式
        ctx.globalCompositeOperation = 'overlay'
        ctx.globalAlpha = intensity / 100
        ctx.fillStyle = selectedColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
      }

      const result = canvas.toDataURL('image/png')
      setProcessedImage(result)
    } catch (error) {
      console.error('Error processing image:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processedImage) return
    const link = document.createElement('a')
    link.download = 'colorized-image.png'
    link.href = processedImage
    link.click()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('nav.colorize_image')}</h1>
        <p className="text-lg text-gray-600">{t('colorize_image.description')}</p>
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
            <p className="mt-4 text-lg text-gray-600">{t('colorize_image.upload')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('colorize_image.supported')}</p>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* 预览区域 */}
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  ref={imgRef}
                  src={selectedImage} 
                  alt="Selected" 
                  className="max-w-full max-h-96 rounded-lg"
                />
                <canvas 
                  ref={previewCanvasRef}
                  className="absolute top-0 left-0 max-w-full max-h-96 rounded-lg pointer-events-none"
                />
              </div>
            </div>

            {/* 模式选择 */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setMode('filter')}
                className={`px-4 py-2 rounded-lg transition ${
                  mode === 'filter' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('colorize_image.mode_filter')}
              </button>
              <button
                onClick={() => setMode('colorize')}
                className={`px-4 py-2 rounded-lg transition ${
                  mode === 'colorize' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('colorize_image.mode_colorize')}
              </button>
            </div>

            {/* 颜色选择 */}
            <div>
              <label className="block text-gray-700 mb-2">{t('colorize_image.select_color')}:</label>
              <div className="grid grid-cols-5 gap-2">
                {colorFilters.map((filter) => (
                  <button
                    key={filter.color}
                    onClick={() => setSelectedColor(filter.color)}
                    className={`w-full aspect-square rounded-lg transition transform hover:scale-105 ${
                      selectedColor === filter.color 
                        ? 'ring-2 ring-primary-600 ring-offset-2' 
                        : ''
                    }`}
                    style={{ backgroundColor: filter.color }}
                    title={filter.name}
                  />
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input 
                  type="color" 
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input 
                  type="text"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* 强度调节 */}
            <div>
              <label className="block text-gray-700 mb-2">
                {t('colorize_image.intensity')}: {intensity}%
              </label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => { setSelectedImage(null); setProcessedImage(null); }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                {t('common.clear')}
              </button>
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {isProcessing ? t('colorize_image.processing') : t('colorize_image.process')}
              </button>
            </div>
          </div>
        )}

        {processedImage && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t('colorize_image.result')}</h3>
            <div className="flex justify-center mb-6">
              <img src={processedImage} alt="Processed" className="max-w-full max-h-96 rounded-lg" />
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setProcessedImage(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                {t('colorize_image.edit')}
              </button>
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                {t('colorize_image.download')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

