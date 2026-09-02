'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A',
  '#F0F0F0', '#E0E0E0', '#C0C0C0', '#808080'
]

export default function ChangeBackground() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [tolerance, setTolerance] = useState(30)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const resultCanvasRef = useRef<HTMLCanvasElement>(null)

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

  const removeBackground = () => {
    if (!originalFile) return
    setIsProcessing(true)
    setProgress(0)

    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      const resultCanvas = resultCanvasRef.current
      if (!canvas || !resultCanvas) return

      const ctx = canvas.getContext('2d')
      const resultCtx = resultCanvas.getContext('2d')
      if (!ctx || !resultCtx) return

      const width = img.width
      const height = img.height

      canvas.width = width
      canvas.height = height
      resultCanvas.width = width
      resultCanvas.height = height

      // 绘制原始图片
      ctx.drawImage(img, 0, 0)
      
      setProgress(20)

      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data

      // 获取四个角落的颜色作为背景色参考
      const cornerColors = [
        { r: data[0], g: data[1], b: data[2] },
        { r: data[(width - 1) * 4], g: data[(width - 1) * 4 + 1], b: data[(width - 1) * 4 + 2] },
        { r: data[(height - 1) * width * 4], g: data[(height - 1) * width * 4 + 1], b: data[(height - 1) * width * 4 + 2] },
        { r: data[(height - 1) * width * 4 + (width - 1) * 4], g: data[(height - 1) * width * 4 + (width - 1) * 4 + 1], b: data[(height - 1) * width * 4 + (width - 1) * 4 + 2] }
      ]

      // 取平均背景色
      const bgR = Math.round(cornerColors.reduce((sum, c) => sum + c.r, 0) / 4)
      const bgG = Math.round(cornerColors.reduce((sum, c) => sum + c.g, 0) / 4)
      const bgB = Math.round(cornerColors.reduce((sum, c) => sum + c.b, 0) / 4)

      setProgress(40)

      // 颜色相似度检测并移除背景
      const targetR = parseInt(bgColor.slice(1, 3), 16)
      const targetG = parseInt(bgColor.slice(3, 5), 16)
      const targetB = parseInt(bgColor.slice(5, 7), 16)

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        // 计算与背景色的距离
        const dist = Math.sqrt(
          Math.pow(r - bgR, 2) + 
          Math.pow(g - bgG, 2) + 
          Math.pow(b - bgB, 2)
        )

        // 如果颜色接近背景色，替换为目标背景色
        if (dist < tolerance * 2.55) {
          // 平滑过渡
          const alpha = Math.min(1, dist / (tolerance * 2.55))
          data[i] = Math.round(r * alpha + targetR * (1 - alpha))
          data[i + 1] = Math.round(g * alpha + targetG * (1 - alpha))
          data[i + 2] = Math.round(b * alpha + targetB * (1 - alpha))
        }
      }

      setProgress(70)

      // 应用更智能的背景检测（边缘检测）
      const edgeData = new Uint8ClampedArray(data)
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4
          
          // 计算与目标背景色的差异
          const diff = Math.abs(data[idx] - targetR) + 
                       Math.abs(data[idx + 1] - targetG) + 
                       Math.abs(data[idx + 2] - targetB)
          
          // 边缘保护：如果周围有非背景色像素，保持原色
          let hasEdge = false
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const nidx = ((y + dy) * width + (x + dx)) * 4
              const ndiff = Math.abs(data[nidx] - targetR) + 
                           Math.abs(data[nidx + 1] - targetG) + 
                           Math.abs(data[nidx + 2] - targetB)
              if (ndiff > tolerance * 3) {
                hasEdge = true
                break
              }
            }
            if (hasEdge) break
          }
        }
      }

      setProgress(90)

      // 填充新背景
      resultCtx.fillStyle = bgColor
      resultCtx.fillRect(0, 0, width, height)
      resultCtx.putImageData(imageData, 0, 0)

      setProgress(100)

      // 生成图片
      setTimeout(() => {
        const dataUrl = resultCanvas.toDataURL('image/png')
        setProcessedImage(dataUrl)
        setIsProcessing(false)
      }, 100)
    }
    img.src = URL.createObjectURL(originalFile)
  }

  const handleDownload = () => {
    if (!processedImage) return
    const link = document.createElement('a')
    link.download = `changed-bg-${originalFile?.name || 'image'}.png`
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('nav.change_background')}</h1>
        <p className="text-lg text-gray-600">{t('change_background.description')}</p>
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
            <p className="mt-4 text-lg text-gray-600">{t('change_background.upload')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('change_background.supported')}</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <img src={selectedImage} alt="Selected" className="max-w-full max-h-96 rounded-lg" />
            </div>

            {!processedImage && !isProcessing && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">{t('change_background.bg_color') || '选择背景色'}</label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setBgColor(color)}
                          className={`w-8 h-8 rounded-lg border-2 transition ${
                            bgColor === color ? 'border-primary-600 ring-2 ring-primary-200' : 'border-gray-300 hover:border-primary-500'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                      <input 
                        type="color" 
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-2 border-gray-300"
                        title="自定义颜色"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      {t('change_background.tolerance') || '检测灵敏度'}: {tolerance}
                    </label>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={tolerance}
                      onChange={(e) => setTolerance(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{t('change_background.tolerance_low') || '低'}</span>
                      <span>{t('change_background.tolerance_high') || '高'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <button onClick={reset} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                    {t('common.clear')}
                  </button>
                  <button onClick={removeBackground} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                    {t('change_background.change')}
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
                  <span className="text-gray-700">{t('change_background.processing')}</span>
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t('change_background.result')}</h3>
            <div className="flex justify-center mb-6">
              <img src={processedImage} alt="Processed" className="max-w-full max-h-96 rounded-lg border border-gray-200" />
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={reset} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                {t('common.another')}
              </button>
              <button onClick={handleDownload} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                {t('change_background.download')}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={resultCanvasRef} className="hidden" />
    </div>
  )
}
