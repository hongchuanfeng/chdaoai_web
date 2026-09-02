'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef, useEffect } from 'react'

type CornerOptions = {
  topLeft: boolean
  topRight: boolean
  bottomLeft: boolean
  bottomRight: boolean
}

type ShapeType = 'rounded' | 'circle'

export default function RoundedCorner() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [shapeType, setShapeType] = useState<ShapeType>('rounded')
  const [radius, setRadius] = useState(20)
  const [corners, setCorners] = useState<CornerOptions>({
    topLeft: true,
    topRight: true,
    bottomLeft: true,
    bottomRight: true
  })
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const applyRoundedCorners = (imageSrc: string, radiusValue: number, cornerOptions: CornerOptions, bgColor: string, type: ShapeType): Promise<string> => {
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

        // 填充背景色
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        if (type === 'circle') {
          // 圆形模式 - 以图片中心为圆心，半径为宽高较小值的一半
          const centerX = img.width / 2
          const centerY = img.height / 2
          const radius = Math.min(img.width, img.height) / 2

          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
          ctx.closePath()
          ctx.clip()

          // 绘制图片
          ctx.drawImage(img, 0, 0)
        } else {
          // 圆角模式
          const r = Math.min(radiusValue, img.width / 2, img.height / 2)

          // 创建圆角矩形路径
          ctx.beginPath()

          // 从左上角开始（如果需要圆角则向右偏移）
          const startX = cornerOptions.topLeft ? r : 0
          ctx.moveTo(startX, 0)

          // 上边到右上角
          if (cornerOptions.topRight) {
            ctx.lineTo(img.width - r, 0)
            ctx.arcTo(img.width, 0, img.width, r, r)
          } else {
            ctx.lineTo(img.width, 0)
          }

          // 右边到右下角
          if (cornerOptions.bottomRight) {
            ctx.lineTo(img.width, img.height - r)
            ctx.arcTo(img.width, img.height, img.width - r, img.height, r)
          } else {
            ctx.lineTo(img.width, img.height)
          }

          // 下边到左下角
          if (cornerOptions.bottomLeft) {
            ctx.lineTo(r, img.height)
            ctx.arcTo(0, img.height, 0, img.height - r, r)
          } else {
            ctx.lineTo(0, img.height)
          }

          // 左边回到左上角
          if (cornerOptions.topLeft) {
            ctx.lineTo(0, r)
            ctx.arcTo(0, 0, r, 0, r)
          } else {
            ctx.lineTo(0, 0)
          }

          ctx.closePath()
          ctx.clip()

          // 绘制图片
          ctx.drawImage(img, 0, 0)
        }

        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = imageSrc
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
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
      const result = await applyRoundedCorners(selectedImage, radius, corners, backgroundColor, shapeType)
      setProcessedImage(result)
    } catch (error) {
      console.error('Rounded corner failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processedImage) return
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
    const suffix = shapeType === 'circle' ? '_circle' : '_rounded'
    const link = document.createElement('a')
    link.download = `${nameWithoutExt}${suffix}.png`
    link.href = processedImage
    link.click()
  }

  const toggleCorner = (corner: keyof CornerOptions) => {
    setCorners(prev => ({ ...prev, [corner]: !prev[corner] }))
    setProcessedImage(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('nav.rounded_corner')}</h1>
        <p className="text-lg text-gray-600">{t('rounded_corner.description')}</p>
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
            <p className="mt-4 text-lg text-gray-600">{t('rounded_corner.upload')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('rounded_corner.supported')}</p>
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
            <div className="flex justify-center">
              <img src={selectedImage} alt="Selected" className="max-w-full max-h-96 rounded-lg" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <label className="text-gray-700">{t('rounded_corner.shape_type') || 'Shape Type'}:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShapeType('rounded'); setProcessedImage(null); }}
                    className={`px-4 py-2 rounded-lg ${shapeType === 'rounded' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {t('rounded_corner.rounded') || '圆角'}
                  </button>
                  <button
                    onClick={() => { setShapeType('circle'); setProcessedImage(null); }}
                    className={`px-4 py-2 rounded-lg ${shapeType === 'circle' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {t('rounded_corner.circle') || '圆形'}
                  </button>
                </div>
              </div>

              {shapeType === 'rounded' && (
                <>
              <div className="flex items-center justify-center gap-4">
                <label className="text-gray-700">{t('rounded_corner.radius')}:</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={radius}
                  onChange={(e) => { setRadius(Number(e.target.value)); setProcessedImage(null); }}
                  className="w-48"
                />
                <span className="text-gray-600">{radius}px</span>
              </div>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className="text-gray-700">{t('rounded_corner.corners') || '圆角位置'}:</span>
                <button
                  onClick={() => toggleCorner('topLeft')}
                  className={`px-3 py-1 rounded ${corners.topLeft ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  ↖ {t('rounded_corner.top_left') || '左上'}
                </button>
                <button
                  onClick={() => toggleCorner('topRight')}
                  className={`px-3 py-1 rounded ${corners.topRight ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  ↗ {t('rounded_corner.top_right') || '右上'}
                </button>
                <button
                  onClick={() => toggleCorner('bottomLeft')}
                  className={`px-3 py-1 rounded ${corners.bottomLeft ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  ↙ {t('rounded_corner.bottom_left') || '左下'}
                </button>
                <button
                  onClick={() => toggleCorner('bottomRight')}
                  className={`px-3 py-1 rounded ${corners.bottomRight ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  ↘ {t('rounded_corner.bottom_right') || '右下'}
                </button>
              </div>
                </>
              )}

              <div className="flex items-center justify-center gap-4">
                <label className="text-gray-700">{t('rounded_corner.background') || '背景颜色'}:</label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => { setBackgroundColor(e.target.value); setProcessedImage(null); }}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                />
                <span className="text-gray-600">{backgroundColor}</span>
              </div>
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
                {isProcessing ? t('rounded_corner.processing') : t('rounded_corner.process')}
              </button>
            </div>
          </div>
        )}

        {processedImage && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t('rounded_corner.result')}</h3>
            <div className="flex justify-center mb-6">
              <img src={processedImage} alt="Processed" className="max-w-full max-h-96" style={{ borderRadius: '0' }} />
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                {t('rounded_corner.download')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

