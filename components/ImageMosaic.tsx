'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef, useEffect } from 'react'

interface SelectionRect {
  x: number
  y: number
  width: number
  height: number
}

export default function ImageMosaic() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [mosaicSize, setMosaicSize] = useState(15)
  const [fullMosaic, setFullMosaic] = useState(false)
  const [selection, setSelection] = useState<SelectionRect | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [originalImageData, setOriginalImageData] = useState<string | null>(null)
  
  // 保存已处理的画布数据，用于二次选择
  const [processedCanvasData, setProcessedCanvasData] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  // 加载图片到 canvas
  useEffect(() => {
    if (!selectedImage || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      
      // 设置 canvas 大小
      const maxWidth = 600
      const maxHeight = 400
      let width = img.width
      let height = img.height
      
      // 保持宽高比
      if (width > maxWidth) {
        height = (maxWidth / width) * height
        width = maxWidth
      }
      if (height > maxHeight) {
        width = (maxHeight / height) * width
        height = maxHeight
      }
      
      canvas.width = width
      canvas.height = height
      
      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height)
      
      // 重置选择区域
      setSelection(null)
      setProcessedImage(null)
      setShowResult(false)
    }
    img.src = selectedImage
  }, [selectedImage])

  // 绘制选择框
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const img = imageRef.current
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    
    // 如果有选择区域，绘制半透明遮罩和边框
    if (selection && selection.width > 0 && selection.height > 0) {
      // 绘制已选择区域的马赛克预览
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 清除选择区域，显示原始图片
      ctx.clearRect(selection.x, selection.y, selection.width, selection.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height, selection.x, selection.y, selection.width, selection.height)
      
      // 绘制选择边框
      ctx.strokeStyle = '#3B82F6'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(selection.x, selection.y, selection.width, selection.height)
      ctx.setLineDash([])
    }
  }, [selection])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setProcessedImage(null)
        setSelection(null)
        setShowResult(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMouseDown = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (fullMosaic || !canvasRef.current) return
    
    // 如果是二次选择，先恢复已处理的画布内容
    if (processedCanvasData) {
      await restoreProcessedCanvas()
      setProcessedCanvasData(null)
    }
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setIsDrawing(true)
    setStartPoint({ x, y })
    setSelection({ x, y, width: 0, height: 0 })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const newSelection = {
      x: Math.min(startPoint.x, x),
      y: Math.min(startPoint.y, y),
      width: Math.abs(x - startPoint.x),
      height: Math.abs(y - startPoint.y)
    }
    
    setSelection(newSelection)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    setStartPoint(null)
  }

  const handleProcess = async () => {
    if (!selectedImage || !canvasRef.current) return
    
    setIsProcessing(true)
    
    // 等待 UI 更新
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const img = imageRef.current
    if (!img) return
    
    // 检查是否有已处理的画布数据（用于二次选择）
    if (processedCanvasData) {
      // 恢复已处理的画布内容，在其基础上继续应用新的马赛克
      await restoreProcessedCanvas()
    } else {
      // 首次处理，绘制原始图片
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    
    // 应用马赛克
    if (fullMosaic) {
      // 全图马赛克
      applyMosaic(ctx, 0, 0, canvas.width, canvas.height, mosaicSize)
    } else if (selection && selection.width > 5 && selection.height > 5) {
      // 区域马赛克
      applyMosaic(ctx, selection.x, selection.y, selection.width, selection.height, mosaicSize)
    } else {
      // 没有选择区域时，给用户提示
      alert(t('image_mosaic.select_area') || '请先选择要马赛克的区域')
      setIsProcessing(false)
      return
    }
    
    // 获取处理后的图片
    const processed = canvas.toDataURL('image/png')
    setProcessedImage(processed)
    setShowResult(true)
    setIsProcessing(false)
  }

  // 马赛克处理函数
  const applyMosaic = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    size: number
  ) => {
    // 确保在边界内
    const canvasWidth = ctx.canvas.width
    const canvasHeight = ctx.canvas.height
    
    x = Math.max(0, Math.floor(x))
    y = Math.max(0, Math.floor(y))
    width = Math.min(canvasWidth - x, Math.floor(width))
    height = Math.min(canvasHeight - y, Math.floor(height))
    
    if (width <= 0 || height <= 0) return
    
    // 获取图像数据
    const imageData = ctx.getImageData(x, y, width, height)
    const data = imageData.data
    
    // 计算马赛克块
    const cols = Math.ceil(width / size)
    const rows = Math.ceil(height / size)
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const startX = col * size
        const startY = row * size
        
        // 计算这个块的平均颜色
        let r = 0, g = 0, b = 0, count = 0
        
        for (let py = startY; py < startY + size && py < height; py++) {
          for (let px = startX; px < startX + size && px < width; px++) {
            const i = (py * width + px) * 4
            r += data[i]
            g += data[i + 1]
            b += data[i + 2]
            count++
          }
        }
        
        r = Math.floor(r / count)
        g = Math.floor(g / count)
        b = Math.floor(b / count)
        
        // 将这个块的所有像素设为平均颜色
        for (let py = startY; py < startY + size && py < height; py++) {
          for (let px = startX; px < startX + size && px < width; px++) {
            const i = (py * width + px) * 4
            data[i] = r
            data[i + 1] = g
            data[i + 2] = b
          }
        }
      }
    }
    
    // 放回图像数据
    ctx.putImageData(imageData, x, y)
  }

  const handleDownload = () => {
    if (!processedImage) return
    const link = document.createElement('a')
    link.download = 'mosaic-image.png'
    link.href = processedImage
    link.click()
  }

  const handleResetSelection = () => {
    // 保存当前画布内容（包含已应用的马赛克）
    if (canvasRef.current) {
      const canvasData = canvasRef.current.toDataURL('image/png')
      setProcessedCanvasData(canvasData)
    }
    // 清除选择区域，允许用户重新选择
    setSelection(null)
    setShowResult(false)
    // 注意：不清除 processedCanvasData，因为下次点击"应用马赛克"时需要基于当前画布继续处理
  }

  // 恢复已处理的画布内容（用于二次选择时）
  const restoreProcessedCanvas = (): Promise<void> => {
    return new Promise((resolve) => {
      if (!processedCanvasData || !canvasRef.current) {
        resolve()
        return
      }
      
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve()
        return
      }
      
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve()
      }
      img.onerror = () => {
        resolve()
      }
      img.src = processedCanvasData
    })
  }

  const handleReset = () => {
    setSelectedImage(null)
    setProcessedImage(null)
    setSelection(null)
    setShowResult(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('nav.image_mosaic')}</h1>
        <p className="text-lg text-gray-600">{t('image_mosaic.description')}</p>
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
            <p className="mt-4 text-lg text-gray-600">{t('image_mosaic.upload')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('image_mosaic.supported')}</p>
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
            <div className="flex justify-center" ref={containerRef}>
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`rounded-lg ${!fullMosaic && !showResult ? 'cursor-crosshair' : ''}`}
                style={{ maxWidth: '100%' }}
              />
            </div>

            {!showResult ? (
              <>
                <div className="flex items-center justify-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fullMosaic}
                      onChange={(e) => {
                        setFullMosaic(e.target.checked)
                        if (e.target.checked) {
                          setSelection(null)
                        }
                      }}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-gray-700">{t('image_mosaic.full_mosaic') || '全图马赛克'}</span>
                  </label>
                </div>

                {!fullMosaic && (
                  <p className="text-sm text-gray-500 text-center">
                    {t('image_mosaic.select_hint') || '在图片上拖拽选择要马赛克的区域'}
                  </p>
                )}

                <div className="flex items-center justify-center gap-4">
                  <label className="text-gray-700">{t('image_mosaic.mosaic_size')}:</label>
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={mosaicSize}
                    onChange={(e) => setMosaicSize(Number(e.target.value))}
                    className="w-48"
                  />
                  <span className="text-gray-600">{mosaicSize}px</span>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    {t('common.clear')}
                  </button>
                  <button
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    {isProcessing ? t('image_mosaic.processing') : t('image_mosaic.apply')}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleResetSelection}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  {t('image_mosaic.edit_again') || '重新选择'}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  {t('image_mosaic.download')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
