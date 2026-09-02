'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

type WatermarkType = 'text' | 'image'
type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'tiled'

export default function AddWatermark() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileName, setFileName] = useState('')
  
  // 水印类型
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text')
  
  // 文字水印设置
  const [watermarkText, setWatermarkText] = useState('')
  const [textSize, setTextSize] = useState(48)
  const [textColor, setTextColor] = useState('#ffffff')
  const [textOpacity, setTextOpacity] = useState(0.7)
  const [textPosition, setTextPosition] = useState<Position>('bottom-right')
  const [textRotation, setTextRotation] = useState(0)
  const [textBold, setTextBold] = useState(false)
  const [textFont, setTextFont] = useState('Arial')
  
  // 图片水印设置
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null)
  const [imageSize, setImageSize] = useState(20)
  const [imageOpacity, setImageOpacity] = useState(0.7)
  const [imagePosition, setImagePosition] = useState<Position>('bottom-right')
  const [imageRotation, setImageRotation] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const watermarkImageInputRef = useRef<HTMLInputElement>(null)

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

  const handleWatermarkImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setWatermarkImage(e.target?.result as string)
        setProcessedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const addTextWatermark = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    img: HTMLImageElement
  ) => {
    ctx.save()
    ctx.globalAlpha = textOpacity
    ctx.font = `${textBold ? 'bold ' : ''}${textSize}px ${textFont}`
    ctx.fillStyle = textColor
    ctx.textBaseline = 'middle'
    
    const text = watermarkText
    const metrics = ctx.measureText(text)
    const textWidth = metrics.width
    const textHeight = textSize
    
    let x = 0
    let y = 0
    const padding = 20
    
    // 计算位置
    switch (textPosition) {
      case 'top-left':
        x = padding
        y = textHeight + padding
        ctx.textAlign = 'left'
        break
      case 'top-right':
        x = canvas.width - padding
        y = textHeight + padding
        ctx.textAlign = 'right'
        break
      case 'bottom-left':
        x = padding
        y = canvas.height - padding
        ctx.textAlign = 'left'
        break
      case 'bottom-right':
        x = canvas.width - padding
        y = canvas.height - padding
        ctx.textAlign = 'right'
        break
      case 'center':
        x = canvas.width / 2
        y = canvas.height / 2
        ctx.textAlign = 'center'
        break
      case 'tiled':
        ctx.rotate((textRotation * Math.PI) / 180)
        const rows = Math.ceil(canvas.height / (textHeight * 2))
        const cols = Math.ceil(canvas.width / (textWidth + 50))
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            ctx.save()
            ctx.translate(col * (textWidth + 50), row * (textHeight * 2))
            ctx.rotate((textRotation * Math.PI) / 180)
            ctx.fillText(text, 0, 0)
            ctx.restore()
          }
        }
        ctx.restore()
        return
    }
    
    // 旋转
    if (textRotation !== 0) {
      ctx.translate(x, y)
      ctx.rotate((textRotation * Math.PI) / 180)
      ctx.fillText(text, 0, 0)
    } else {
      ctx.fillText(text, x, y)
    }
    
    ctx.restore()
  }

  const addImageWatermark = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    watermarkImg: HTMLImageElement
  ) => {
    ctx.save()
    ctx.globalAlpha = imageOpacity
    
    const wmWidth = (canvas.width * imageSize) / 100
    const wmHeight = (watermarkImg.height * wmWidth) / watermarkImg.width
    
    let x = 0
    let y = 0
    const padding = 20
    
    switch (imagePosition) {
      case 'top-left':
        x = padding
        y = padding
        break
      case 'top-right':
        x = canvas.width - wmWidth - padding
        y = padding
        break
      case 'bottom-left':
        x = padding
        y = canvas.height - wmHeight - padding
        break
      case 'bottom-right':
        x = canvas.width - wmWidth - padding
        y = canvas.height - wmHeight - padding
        break
      case 'center':
        x = (canvas.width - wmWidth) / 2
        y = (canvas.height - wmHeight) / 2
        break
      case 'tiled':
        ctx.rotate((imageRotation * Math.PI) / 180)
        const rows = Math.ceil(canvas.height / (wmHeight * 1.5))
        const cols = Math.ceil(canvas.width / (wmWidth * 1.5))
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            ctx.save()
            ctx.translate(col * (wmWidth * 1.5), row * (wmHeight * 1.5))
            ctx.rotate((imageRotation * Math.PI) / 180)
            ctx.drawImage(watermarkImg, 0, 0, wmWidth, wmHeight)
            ctx.restore()
          }
        }
        ctx.restore()
        return
    }
    
    ctx.translate(x + wmWidth / 2, y + wmHeight / 2)
    ctx.rotate((imageRotation * Math.PI) / 180)
    ctx.drawImage(watermarkImg, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight)
    
    ctx.restore()
  }

  const handleProcess = async () => {
    if (!selectedImage) return
    if (watermarkType === 'text' && !watermarkText) return
    if (watermarkType === 'image' && !watermarkImage) return
    
    setIsProcessing(true)
    
    try {
      const img = new Image()
      img.src = selectedImage
      
      await new Promise<void>((resolve) => {
        img.onload = () => resolve()
      })
      
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      // 绘制原图
      ctx.drawImage(img, 0, 0)
      
      if (watermarkType === 'text') {
        addTextWatermark(ctx, canvas, img)
      } else if (watermarkType === 'image' && watermarkImage) {
        const watermarkImg = new Image()
        watermarkImg.src = watermarkImage
        
        await new Promise<void>((resolve) => {
          watermarkImg.onload = () => resolve()
        })
        
        addImageWatermark(ctx, canvas, watermarkImg)
      }
      
      setProcessedImage(canvas.toDataURL('image/png'))
    } catch (error) {
      console.error('Watermark failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processedImage) return
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
    const link = document.createElement('a')
    link.download = `${nameWithoutExt}_watermarked.png`
    link.href = processedImage
    link.click()
  }

  const handleReset = () => {
    setSelectedImage(null)
    setProcessedImage(null)
    setWatermarkText('')
    setWatermarkImage(null)
    setFileName('')
  }

  const canProcess = () => {
    if (!selectedImage) return false
    if (watermarkType === 'text' && !watermarkText) return false
    if (watermarkType === 'image' && !watermarkImage) return false
    return true
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('nav.add_watermark')}</h1>
        <p className="text-lg text-gray-600">{t('add_watermark.description')}</p>
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
            <p className="mt-4 text-lg text-gray-600">{t('add_watermark.upload')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('add_watermark.supported')}</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <img src={selectedImage} alt="Selected" className="max-w-full max-h-96 rounded-lg" />
            </div>

            {/* 水印类型选择 */}
            <div className="border-t pt-6">
              <label className="block text-gray-700 mb-3">{t('add_watermark.type') || '水印类型'}</label>
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => { setWatermarkType('text'); setProcessedImage(null); }}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                    watermarkType === 'text' 
                      ? 'border-primary-600 bg-primary-50 text-primary-700' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="block text-sm font-medium">{t('add_watermark.text_watermark') || '文字水印'}</span>
                </button>
                <button
                  onClick={() => { setWatermarkType('image'); setProcessedImage(null); }}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                    watermarkType === 'image' 
                      ? 'border-primary-600 bg-primary-50 text-primary-700' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="block text-sm font-medium">{t('add_watermark.image_watermark') || '图片水印'}</span>
                </button>
              </div>
            </div>

            {/* 文字水印设置 */}
            {watermarkType === 'text' && (
              <div className="space-y-4 border-t pt-6">
                <div>
                  <label className="block text-gray-700 mb-2">{t('add_watermark.watermark_text')}</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => { setWatermarkText(e.target.value); setProcessedImage(null); }}
                    placeholder={t('add_watermark.placeholder')}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">{t('add_watermark.font_size') || '字体大小'}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="12"
                        max="120"
                        value={textSize}
                        onChange={(e) => { setTextSize(Number(e.target.value)); setProcessedImage(null); }}
                        className="flex-1"
                      />
                      <span className="text-gray-600 w-12 text-right">{textSize}px</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">{t('add_watermark.opacity') || '透明度'}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={textOpacity}
                        onChange={(e) => { setTextOpacity(Number(e.target.value)); setProcessedImage(null); }}
                        className="flex-1"
                      />
                      <span className="text-gray-600 w-12 text-right">{Math.round(textOpacity * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">{t('add_watermark.color') || '颜色'}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => { setTextColor(e.target.value); setProcessedImage(null); }}
                        className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                      />
                      <span className="text-gray-600">{textColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">{t('add_watermark.rotation') || '旋转角度'}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={textRotation}
                        onChange={(e) => { setTextRotation(Number(e.target.value)); setProcessedImage(null); }}
                        className="flex-1"
                      />
                      <span className="text-gray-600 w-12 text-right">{textRotation}°</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">{t('add_watermark.position') || '位置'}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'top-left', label: t('add_watermark.top_left') || '左上' },
                      { value: 'top-right', label: t('add_watermark.top_right') || '右上' },
                      { value: 'center', label: t('add_watermark.center') || '居中' },
                      { value: 'bottom-left', label: t('add_watermark.bottom_left') || '左下' },
                      { value: 'bottom-right', label: t('add_watermark.bottom_right') || '右下' },
                      { value: 'tiled', label: t('add_watermark.tiled') || '平铺' },
                    ].map((pos) => (
                      <button
                        key={pos.value}
                        onClick={() => { setTextPosition(pos.value as Position); setProcessedImage(null); }}
                        className={`py-2 px-3 rounded border text-sm transition ${
                          textPosition === pos.value
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">{t('add_watermark.font') || '字体'}</label>
                    <select
                      value={textFont}
                      onChange={(e) => { setTextFont(e.target.value); setProcessedImage(null); }}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={textBold}
                        onChange={(e) => { setTextBold(e.target.checked); setProcessedImage(null); }}
                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700">{t('add_watermark.bold') || '加粗'}</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 图片水印设置 */}
            {watermarkType === 'image' && (
              <div className="space-y-4 border-t pt-6">
                <div>
                  <label className="block text-gray-700 mb-2">{t('add_watermark.watermark_image') || '水印图片'}</label>
                  {!watermarkImage ? (
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition"
                      onClick={() => watermarkImageInputRef.current?.click()}
                    >
                      <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">{t('add_watermark.upload_watermark') || '上传水印图片'}</p>
                      <input 
                        ref={watermarkImageInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleWatermarkImageChange}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <img src={watermarkImage} alt="Watermark" className="w-20 h-20 object-contain border rounded-lg p-1" />
                      <button
                        onClick={() => { setWatermarkImage(null); setProcessedImage(null); }}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        {t('common.remove') || '移除'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">{t('add_watermark.image_size') || '水印大小'}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={imageSize}
                        onChange={(e) => { setImageSize(Number(e.target.value)); setProcessedImage(null); }}
                        className="flex-1"
                      />
                      <span className="text-gray-600 w-12 text-right">{imageSize}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">{t('add_watermark.opacity') || '透明度'}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={imageOpacity}
                        onChange={(e) => { setImageOpacity(Number(e.target.value)); setProcessedImage(null); }}
                        className="flex-1"
                      />
                      <span className="text-gray-600 w-12 text-right">{Math.round(imageOpacity * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">{t('add_watermark.rotation') || '旋转角度'}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={imageRotation}
                      onChange={(e) => { setImageRotation(Number(e.target.value)); setProcessedImage(null); }}
                      className="flex-1"
                    />
                    <span className="text-gray-600 w-12 text-right">{imageRotation}°</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">{t('add_watermark.position') || '位置'}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'top-left', label: t('add_watermark.top_left') || '左上' },
                      { value: 'top-right', label: t('add_watermark.top_right') || '右上' },
                      { value: 'center', label: t('add_watermark.center') || '居中' },
                      { value: 'bottom-left', label: t('add_watermark.bottom_left') || '左下' },
                      { value: 'bottom-right', label: t('add_watermark.bottom_right') || '右下' },
                      { value: 'tiled', label: t('add_watermark.tiled') || '平铺' },
                    ].map((pos) => (
                      <button
                        key={pos.value}
                        onClick={() => { setImagePosition(pos.value as Position); setProcessedImage(null); }}
                        className={`py-2 px-3 rounded border text-sm transition ${
                          imagePosition === pos.value
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4 pt-4">
              <button onClick={handleReset} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                {t('common.clear')}
              </button>
              <button onClick={handleProcess} disabled={isProcessing || !canProcess()} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50">
                {isProcessing ? t('add_watermark.processing') : t('add_watermark.add')}
              </button>
            </div>
          </div>
        )}

        {processedImage && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t('add_watermark.result')}</h3>
            <div className="flex justify-center mb-6">
              <img src={processedImage} alt="Processed" className="max-w-full max-h-96 rounded-lg" />
            </div>
            <div className="flex justify-center">
              <button onClick={handleDownload} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                {t('add_watermark.download')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
