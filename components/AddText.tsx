'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef, useEffect } from 'react'

interface Position {
  x: number
  y: number
}

export default function AddText() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState(32)
  const [fontColor, setFontColor] = useState('#000000')
  const [position, setPosition] = useState<Position>({ x: 50, y: 50 })
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [displayScale, setDisplayScale] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

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
        setPosition({ x: 50, y: 50 })
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

  const handleTextDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !previewRef.current || !selectedImage) return
      
      const rect = previewRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      
      setPosition({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y))
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, selectedImage])

  const handleProcess = async () => {
    if (!selectedImage || !text) return
    
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

      const x = (position.x / 100) * canvas.width
      const y = (position.y / 100) * canvas.height

      ctx.font = `${fontSize}px Arial`
      ctx.fillStyle = fontColor
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.fillText(text, x, y)

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
    link.download = 'image-with-text.png'
    link.href = processedImage
    link.click()
  }

  // 预览时的字体大小（根据显示缩放比例调整）
  const previewFontSize = fontSize * displayScale

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('nav.add_text')}</h1>
        <p className="text-lg text-gray-600">{t('add_text.description')}</p>
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
            <p className="mt-4 text-lg text-gray-600">{t('add_text.upload')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('add_text.supported')}</p>
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
              <div 
                ref={previewRef}
                className="relative inline-block max-w-full"
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <img 
                  ref={imgRef}
                  src={selectedImage} 
                  alt="Selected" 
                  className="max-w-full max-h-96 rounded-lg"
                  draggable={false}
                />
                {text && (
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      fontSize: `${previewFontSize}px`,
                      color: fontColor,
                      fontFamily: 'Arial',
                      whiteSpace: 'nowrap',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                    }}
                  >
                    {text}
                  </div>
                )}
                {text && (
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                    }}
                    onMouseDown={handleTextDragStart}
                  >
                    <div 
                      className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 transition"
                      style={{ 
                        border: '2px solid white',
                        fontSize: '14px'
                      }}
                    >
                      ✛
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">{t('add_text.text')}:</label>
                <input 
                  type="text" 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t('add_text.text_placeholder')}
                  style={{ color: '#000000' }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">{t('add_text.font_size')}: {fontSize}px</label>
                  <input 
                    type="range" 
                    min="12" 
                    max="120" 
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">{t('add_text.color')}:</label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={fontColor}
                      onChange={(e) => setFontColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={fontColor}
                      onChange={(e) => setFontColor(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">{t('add_text.position')}: X: {Math.round(position.x)}% Y: {Math.round(position.y)}%</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-4">X</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={position.x}
                        onChange={(e) => setPosition(prev => ({ ...prev, x: Number(e.target.value) }))}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-4">Y</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={position.y}
                        onChange={(e) => setPosition(prev => ({ ...prev, y: Number(e.target.value) }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => { setSelectedImage(null); setProcessedImage(null); setText(''); setPosition({ x: 50, y: 50 }); }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                {t('common.clear')}
              </button>
              <button
                onClick={handleProcess}
                disabled={isProcessing || !text}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {isProcessing ? t('add_text.processing') : t('add_text.process')}
              </button>
            </div>
          </div>
        )}

        {processedImage && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t('add_text.result')}</h3>
            <div className="flex justify-center mb-6">
              <img src={processedImage} alt="Processed" className="max-w-full max-h-96 rounded-lg" />
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setProcessedImage(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                {t('add_text.edit')}
              </button>
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                {t('add_text.download')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

