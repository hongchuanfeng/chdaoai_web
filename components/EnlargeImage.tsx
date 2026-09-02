'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

const SCALES = [2, 3, 4]

export default function EnlargeImage() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [scale, setScale] = useState(2)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setOriginalFile(file)
        setProcessedImage(null)
        setProgress(0)
      }
      reader.readAsDataURL(file)
    }
  }

  const enlargeImage = () => {
    if (!originalFile) return
    setIsProcessing(true)
    setProgress(0)

    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const originalWidth = img.width
      const originalHeight = img.height
      const newWidth = Math.round(originalWidth * scale)
      const newHeight = Math.round(originalHeight * scale)

      canvas.width = newWidth
      canvas.height = newHeight

      // 使用高质量的图像缩放算法
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // 多次缩放以提高质量
      if (scale > 2) {
        // 第一次缩放到2倍
        const tempCanvas1 = document.createElement('canvas')
        tempCanvas1.width = originalWidth * 2
        tempCanvas1.height = originalHeight * 2
        const tempCtx1 = tempCanvas1.getContext('2d')
        if (tempCtx1) {
          tempCtx1.imageSmoothingEnabled = true
          tempCtx1.imageSmoothingQuality = 'high'
          tempCtx1.drawImage(img, 0, 0, tempCanvas1.width, tempCanvas1.height)
        }

        setProgress(30)

        // 第二次缩放到目标倍数
        setTimeout(() => {
          ctx.drawImage(tempCanvas1, 0, 0, newWidth, newHeight)
          setProgress(60)

          // 锐化处理
          sharpenImage(ctx, newWidth, newHeight)
          
          setProgress(80)

          // 生成图片
          setTimeout(() => {
            const dataUrl = canvas.toDataURL('image/png', 1.0)
            setProcessedImage(dataUrl)
            setProgress(100)
            setIsProcessing(false)
          }, 200)
        }, 100)
      } else {
        // 直接缩放
        ctx.drawImage(img, 0, 0, newWidth, newHeight)
        setProgress(50)
        sharpenImage(ctx, newWidth, newHeight)
        setProgress(80)
        
        setTimeout(() => {
          const dataUrl = canvas.toDataURL('image/png', 1.0)
          setProcessedImage(dataUrl)
          setProgress(100)
          setIsProcessing(false)
        }, 200)
      }
    }
    img.src = URL.createObjectURL(originalFile)
  }

  const sharpenImage = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 简单的锐化处理
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const copy = new Uint8ClampedArray(data)
    
    const sharpenAmount = 0.3
    
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % width
      const y = Math.floor((i / 4) / width)
      
      if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
        const idx = i / 4
        const idxLeft = idx - 1
        const idxRight = idx + 1
        const idxUp = idx - width
        const idxDown = idx + width
        
        for (let c = 0; c < 3; c++) {
          const center = copy[idx * 4 + c]
          const left = copy[idxLeft * 4 + c]
          const right = copy[idxRight * 4 + c]
          const up = copy[idxUp * 4 + c]
          const down = copy[idxDown * 4 + c]
          
          const sharpened = center * (1 + 4 * sharpenAmount) - (left + right + up + down) * sharpenAmount
          data[idx * 4 + c] = Math.max(0, Math.min(255, sharpened))
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
  }

  const handleDownload = () => {
    if (!processedImage) return
    const link = document.createElement('a')
    link.download = `enlarged-${scale}x-${originalFile?.name || 'image'}.png`
    link.href = processedImage
    link.click()
  }

  const reset = () => {
    setSelectedImage(null)
    setOriginalFile(null)
    setProcessedImage(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('nav.enlarge_image')}</h1>
        <p className="text-lg text-gray-600">{t('enlarge_image.description')}</p>
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
            <p className="mt-4 text-lg text-gray-600">{t('enlarge_image.upload')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('enlarge_image.supported')}</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <img src={selectedImage} alt="Selected" className="max-w-full max-h-96 rounded-lg" />
            </div>
            
            {!processedImage && !isProcessing && (
              <>
                <div className="flex items-center justify-center gap-4">
                  <label className="text-gray-700">{t('enlarge_image.scale')}:</label>
                  <div className="flex gap-2">
                    {SCALES.map(s => (
                      <button
                        key={s}
                        onClick={() => setScale(s)}
                        className={`px-4 py-2 rounded-lg border transition ${
                          scale === s
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-300 text-gray-700 hover:border-primary-500'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <button onClick={reset} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                    {t('common.clear')}
                  </button>
                  <button onClick={enlargeImage} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                    {t('enlarge_image.enlarge')}
                  </button>
                </div>
              </>
            )}

            {isProcessing && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <svg className="animate-spin h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-700">{t('enlarge_image.processing')}</span>
                </div>
                <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm text-gray-500">{progress}%</p>
              </div>
            )}
          </div>
        )}

        {processedImage && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t('enlarge_image.result')}</h3>
            <div className="flex justify-center mb-6">
              <img src={processedImage} alt="Processed" className="max-w-full rounded-lg border border-gray-200" />
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={reset} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                {t('common.another')}
              </button>
              <button onClick={handleDownload} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                {t('enlarge_image.download')}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
