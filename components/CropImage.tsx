'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef, useEffect } from 'react'

type AspectRatio = 'free' | '1:1' | '4:3' | '16:9' | '3:2' | '2:3' | '9:16'

export default function CropImage() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('free')
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0 })
  const [fileName, setFileName] = useState('')
  
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 计算显示比例
  const displayScale = imageSize.width > 0 ? displaySize.width / imageSize.width : 0

  useEffect(() => {
    if (selectedImage && imageRef.current) {
      const img = imageRef.current
      const containerWidth = containerRef.current?.clientWidth || 600
      const containerHeight = 500
      
      let displayWidth = img.naturalWidth
      let displayHeight = img.naturalHeight
      
      const scale = Math.min(
        (containerWidth - 40) / displayWidth,
        (containerHeight - 40) / displayHeight,
        1
      )
      
      displayWidth = displayWidth * scale
      displayHeight = displayHeight * scale
      
      setDisplaySize({ width: displayWidth, height: displayHeight })
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight })
      
      // 设置默认裁剪区域（居中）
      setCropArea({
        x: (img.naturalWidth - 200) / 2,
        y: (img.naturalHeight - 200) / 2,
        width: 200,
        height: 200
      })
    }
  }, [selectedImage])

  useEffect(() => {
    if (aspectRatio !== 'free' && imageSize.width > 0) {
      const [w, h] = aspectRatio.split(':').map(Number)
      const ratio = w / h
      
      let newWidth = cropArea.width
      let newHeight = newWidth / ratio
      
      if (newHeight > imageSize.height) {
        newHeight = imageSize.height * 0.8
        newWidth = newHeight * ratio
      }
      
      setCropArea(prev => ({
        ...prev,
        width: Math.min(newWidth, imageSize.width),
        height: Math.min(newHeight, imageSize.height)
      }))
    }
  }, [aspectRatio])

  const handleMouseDown = (e: React.MouseEvent, type: string) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragType(type)
    setDragStart({ 
      x: e.clientX, 
      y: e.clientY,
      cropX: cropArea.x,
      cropY: cropArea.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageSize.width) return
    
    const dx = (e.clientX - dragStart.x) / displayScale
    const dy = (e.clientY - dragStart.y) / displayScale
    
    if (dragType === 'move') {
      // 移动整个裁剪框
      let newX = dragStart.cropX + dx
      let newY = dragStart.cropY + dy
      
      // 边界检查
      newX = Math.max(0, Math.min(newX, imageSize.width - cropArea.width))
      newY = Math.max(0, Math.min(newY, imageSize.height - cropArea.height))
      
      setCropArea(prev => ({ ...prev, x: newX, y: newY }))
    } else if (dragType === 'n') {
      // 调整顶部
      let newY = dragStart.cropY + dy
      let newHeight = cropArea.height - dy
      
      if (newHeight < 50) {
        newY = cropArea.y + cropArea.height - 50
        newHeight = 50
      }
      newY = Math.max(0, newY)
      newHeight = Math.min(newHeight, imageSize.height - newY)
      
      setCropArea(prev => ({ ...prev, y: newY, height: newHeight }))
    } else if (dragType === 's') {
      // 调整底部
      let newHeight = cropArea.height + dy
      newHeight = Math.max(50, Math.min(newHeight, imageSize.height - cropArea.y))
      setCropArea(prev => ({ ...prev, height: newHeight }))
    } else if (dragType === 'w') {
      // 调整左侧
      let newX = dragStart.cropX + dx
      let newWidth = cropArea.width - dx
      
      if (newWidth < 50) {
        newX = cropArea.x + cropArea.width - 50
        newWidth = 50
      }
      newX = Math.max(0, newX)
      newWidth = Math.min(newWidth, imageSize.width - newX)
      
      setCropArea(prev => ({ ...prev, x: newX, width: newWidth }))
    } else if (dragType === 'e') {
      // 调整右侧
      let newWidth = cropArea.width + dx
      newWidth = Math.max(50, Math.min(newWidth, imageSize.width - cropArea.x))
      setCropArea(prev => ({ ...prev, width: newWidth }))
    } else if (dragType === 'se') {
      // 右下角
      let newWidth = cropArea.width + dx
      let newHeight = cropArea.height + dy
      
      if (aspectRatio !== 'free') {
        const [w, h] = aspectRatio.split(':').map(Number)
        const ratio = w / h
        newHeight = newWidth / ratio
      }
      
      newWidth = Math.max(50, Math.min(newWidth, imageSize.width - cropArea.x))
      newHeight = Math.max(50, Math.min(newHeight, imageSize.height - cropArea.y))
      
      setCropArea(prev => ({ ...prev, width: newWidth, height: newHeight }))
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragType(null)
  }

  const cropImage = async () => {
    if (!selectedImage) return
    
    setIsProcessing(true)
    
    try {
      const img = new Image()
      img.src = selectedImage
      
      await new Promise(resolve => { img.onload = resolve })
      
      const canvas = document.createElement('canvas')
      canvas.width = cropArea.width
      canvas.height = cropArea.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      )
      
      const result = canvas.toDataURL('image/png')
      setProcessedImage(result)
    } catch (error) {
      console.error('Crop failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processedImage) return
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
    const link = document.createElement('a')
    link.download = `${nameWithoutExt}_cropped.png`
    link.href = processedImage
    link.click()
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('nav.crop_image')}</h1>
        <p className="text-lg text-gray-600">{t('crop_image.description')}</p>
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
            <p className="mt-4 text-lg text-gray-600">{t('crop_image.upload')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('crop_image.supported')}</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* 宽高比选择 */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <label className="text-gray-700">{t('crop_image.aspect_ratio') || '宽高比'}:</label>
              <select 
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="free">{t('crop_image.free') || '自由'}</option>
                <option value="1:1">1:1</option>
                <option value="4:3">4:3</option>
                <option value="16:9">16:9</option>
                <option value="3:2">3:2</option>
                <option value="2:3">2:3</option>
                <option value="9:16">9:16</option>
              </select>
            </div>
            
            {/* 裁剪区域信息 */}
            <div className="text-center text-sm text-gray-600">
              {t('crop_image.size') || '裁剪尺寸'}: {Math.round(cropArea.width)} × {Math.round(cropArea.height)} px
            </div>

            {/* 裁剪容器 */}
            <div 
              ref={containerRef}
              className="relative mx-auto overflow-hidden bg-gray-100 rounded-lg select-none"
              style={{ width: displaySize.width, height: displaySize.height }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img 
                ref={imageRef}
                src={selectedImage} 
                alt="Crop" 
                className="absolute top-0 left-0 pointer-events-none"
                style={{ width: displaySize.width, height: displaySize.height }}
                onLoad={() => {
                  if (imageRef.current) {
                    setImageSize({ width: imageRef.current.naturalWidth, height: imageRef.current.naturalHeight })
                  }
                }}
              />
              
              {/* 裁剪框遮罩 - 使用 CSS clip-path */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  clipPath: `polygon(
                    0% 0%, 
                    ${cropArea.x * displayScale}px 0%, 
                    ${cropArea.x * displayScale}px ${cropArea.y * displayScale}px,
                    0% ${cropArea.y * displayScale}px,
                    0% 100%,
                    100% 100%,
                    100% ${(cropArea.y + cropArea.height) * displayScale}px,
                    ${(cropArea.x + cropArea.width) * displayScale}px ${(cropArea.y + cropArea.height) * displayScale}px,
                    ${(cropArea.x + cropArea.width) * displayScale}px 100%,
                    0% 100%
                  )`
                }}
              />
              
              {/* 裁剪框 - 可移动 */}
              <div 
                className="absolute border-2 border-white cursor-move"
                style={{
                  top: cropArea.y * displayScale,
                  left: cropArea.x * displayScale,
                  width: cropArea.width * displayScale,
                  height: cropArea.height * displayScale,
                }}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
              >
                {/* 网格线 */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-50">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white" />
                  ))}
                </div>
                
                {/* 顶部边框 - 可拖动调整 */}
                <div 
                  className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-primary-500 hover:bg-opacity-50"
                  onMouseDown={(e) => handleMouseDown(e, 'n')}
                />
                
                {/* 底部边框 */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-primary-500 hover:bg-opacity-50"
                  onMouseDown={(e) => handleMouseDown(e, 's')}
                />
                
                {/* 左侧边框 */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-primary-500 hover:bg-opacity-50"
                  onMouseDown={(e) => handleMouseDown(e, 'w')}
                />
                
                {/* 右侧边框 */}
                <div 
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-primary-500 hover:bg-opacity-50"
                  onMouseDown={(e) => handleMouseDown(e, 'e')}
                />
                
                {/* 右下角调整 */}
                <div 
                  className="absolute bottom-0 right-0 w-4 h-4 bg-white rounded-sm cursor-se-resize hover:bg-primary-500"
                  style={{ transform: 'translate(50%, 50%)' }}
                  onMouseDown={(e) => handleMouseDown(e, 'se')}
                >
                  <svg className="w-full h-full text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={() => { setSelectedImage(null); setProcessedImage(null); }} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                {t('common.clear')}
              </button>
              <button onClick={cropImage} disabled={isProcessing} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50">
                {isProcessing ? t('crop_image.processing') : t('crop_image.crop')}
              </button>
            </div>
          </div>
        )}

        {processedImage && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t('crop_image.result')}</h3>
            <div className="flex justify-center mb-6">
              <img src={processedImage} alt="Processed" className="max-w-full max-h-96 rounded-lg" />
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={handleDownload} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                {t('crop_image.download')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

