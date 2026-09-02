'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef, useEffect } from 'react'

export default function ImageGrid() {
  const { t } = useLanguage()
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [gridCols, setGridCols] = useState(2)
  const [gridSpacing, setGridSpacing] = useState(10)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages: string[] = []
      let loadedCount = 0
      
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (event) => {
          newImages.push(event.target?.result as string)
          loadedCount++
          if (loadedCount === files.length) {
            setSelectedImages(prev => [...prev, ...newImages])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const createGrid = async () => {
    if (selectedImages.length === 0) return
    
    setIsProcessing(true)
    
    try {
      const images: HTMLImageElement[] = await Promise.all(
        selectedImages.map(src => {
          return new Promise<HTMLImageElement>((resolve) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = () => resolve(null as any)
            img.src = src
          })
        })
      )
      
      const validImages = images.filter(img => img && img.width > 0)
      if (validImages.length === 0) {
        setIsProcessing(false)
        return
      }
      
      // 计算网格尺寸
      const cols = gridCols
      const rows = Math.ceil(validImages.length / cols)
      const cellWidth = 400
      const cellHeight = 400
      const spacing = gridSpacing
      
      const totalWidth = cols * cellWidth + (cols - 1) * spacing
      const totalHeight = rows * cellHeight + (rows - 1) * spacing
      
      const canvas = document.createElement('canvas')
      canvas.width = totalWidth
      canvas.height = totalHeight
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setIsProcessing(false)
        return
      }
      
      // 填充背景色
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, totalWidth, totalHeight)
      
      // 绘制图片
      validImages.forEach((img, idx) => {
        const col = idx % cols
        const row = Math.floor(idx / cols)
        const x = col * (cellWidth + spacing)
        const y = row * (cellHeight + spacing)
        
        // 计算图片缩放（保持比例填充）
        const imgRatio = img.width / img.height
        const cellRatio = cellWidth / cellHeight
        
        let drawWidth = cellWidth
        let drawHeight = cellHeight
        let drawX = x
        let drawY = y
        
        if (imgRatio > cellRatio) {
          drawHeight = cellWidth / imgRatio
          drawY = y + (cellHeight - drawHeight) / 2
        } else {
          drawWidth = cellHeight * imgRatio
          drawX = x + (cellWidth - drawWidth) / 2
        }
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
      })
      
      const dataUrl = canvas.toDataURL('image/png')
      setProcessedImage(dataUrl)
    } catch (error) {
      console.error('Grid creation failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processedImage) return
    const link = document.createElement('a')
    link.download = 'image-grid.png'
    link.href = processedImage
    link.click()
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, idx) => idx !== index))
    setProcessedImage(null)
  }

  const clearAll = () => {
    setSelectedImages([])
    setProcessedImage(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('nav.image_grid')}</h1>
        <p className="text-lg text-gray-600">{t('image_grid.description')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
          <label className="text-gray-700">{t('image_grid.columns')}:</label>
          <select 
            value={gridCols}
            onChange={(e) => { setGridCols(Number(e.target.value)); setProcessedImage(null); }}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
          
          <label className="text-gray-700 ml-4">{t('image_grid.spacing')}:</label>
          <select 
            value={gridSpacing}
            onChange={(e) => { setGridSpacing(Number(e.target.value)); setProcessedImage(null); }}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value={0}>0px</option>
            <option value={5}>5px</option>
            <option value={10}>10px</option>
            <option value={20}>20px</option>
          </select>
          
          <label className="text-gray-700 ml-4">{t('image_grid.background')}:</label>
          <input 
            type="color"
            value={backgroundColor}
            onChange={(e) => { setBackgroundColor(e.target.value); setProcessedImage(null); }}
            className="w-10 h-10 rounded cursor-pointer border border-gray-300"
          />
        </div>

        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition mb-6"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-lg text-gray-600">{t('image_grid.upload_multiple')}</p>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            multiple
            className="hidden" 
            onChange={handleFileChange}
          />
          <p className="mt-2 text-sm text-gray-500">{t('image_grid.supported')}</p>
        </div>

        {selectedImages.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-600">{selectedImages.length} {t('image_grid.images_selected')}</p>
              <button
                onClick={clearAll}
                className="text-sm text-red-500 hover:text-red-700"
              >
                {t('common.clear')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img} alt={`Selected ${idx}`} className="w-20 h-20 object-cover rounded" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={createGrid}
            disabled={isProcessing || selectedImages.length === 0}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {isProcessing ? t('image_grid.processing') : t('image_grid.create_grid')}
          </button>
        </div>

        {processedImage && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t('image_grid.result')}</h3>
            <div className="flex justify-center mb-6">
              <img src={processedImage} alt="Processed" className="max-w-full rounded-lg" />
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                {t('image_grid.download')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

