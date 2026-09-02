'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

const FORMATS = [
  { value: 'png', label: 'PNG', mime: 'image/png', description: 'PNG - 无损质量，支持透明' },
  { value: 'jpeg', label: 'JPG', mime: 'image/jpeg', description: 'JPEG - 有损压缩，文件较小' },
  { value: 'webp', label: 'WebP', mime: 'image/webp', description: 'WebP - 现代格式，高压缩率' },
  { value: 'gif', label: 'GIF', mime: 'image/gif', description: 'GIF - 动图支持' },
  { value: 'bmp', label: 'BMP', mime: 'image/bmp', description: 'BMP - 无压缩位图' }
]

export default function ImageFormatConversion() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [originalInfo, setOriginalInfo] = useState<{ name: string; size: string; width: number; height: number; format: string } | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [processedInfo, setProcessedInfo] = useState<{ size: string; width: number; height: number } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [format, setFormat] = useState('png')
  const [quality, setQuality] = useState(90)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setSelectedImage(result)
        setOriginalFile(file)
        setProcessedImage(null)
        setProcessedInfo(null)

        // 获取图片尺寸
        const img = new Image()
        img.onload = () => {
          const ext = file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'
          setOriginalInfo({
            name: file.name,
            size: formatFileSize(file.size),
            width: img.width,
            height: img.height,
            format: ext
          })
        }
        img.src = result
      }
      reader.readAsDataURL(file)
    }
  }

  const convertImage = () => {
    if (!originalFile) return
    setIsProcessing(true)
    setProgress(0)

    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height

      setProgress(30)

      // 白色背景（用于PNG转JPEG等场景）
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      setProgress(60)

      const selectedFormat = FORMATS.find(f => f.value === format)
      const mimeType = selectedFormat?.mime || 'image/png'
      const qualityValue = format === 'png' ? undefined : quality / 100

      setProgress(80)

      const dataUrl = canvas.toDataURL(mimeType, qualityValue)

      setProgress(100)

      // 计算转换后的大小
      const base64 = dataUrl.split(',')[1]
      const decodedLength = base64.length
      const sizeInBytes = Math.round((3 * decodedLength) / 4)

      setProcessedInfo({
        size: formatFileSize(sizeInBytes),
        width: img.width,
        height: img.height
      })

      setProcessedImage(dataUrl)
      setIsProcessing(false)
    }
    img.src = URL.createObjectURL(originalFile)
  }

  const handleDownload = () => {
    if (!processedImage) return
    const ext = format === 'jpeg' ? 'jpg' : format
    const baseName = originalFile?.name.split('.')[0] || 'image'
    const link = document.createElement('a')
    link.download = `${baseName}.${ext}`
    link.href = processedImage
    link.click()
  }

  const reset = () => {
    setSelectedImage(null)
    setOriginalFile(null)
    setOriginalInfo(null)
    setProcessedImage(null)
    setProcessedInfo(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const selectedFormat = FORMATS.find(f => f.value === format)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('nav.image_format_conversion')}</h1>
        <p className="text-lg text-gray-600">{t('image_format_conversion.description')}</p>
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
            <p className="mt-4 text-lg text-gray-600">{t('image_format_conversion.upload')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('image_format_conversion.supported')}</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <img src={selectedImage} alt="Selected" className="max-w-full max-h-80 rounded-lg" />
            </div>

            {originalInfo && (
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-gray-500">{t('image_format_conversion.original_name') || '文件名'}:</span>
                    <p className="font-medium text-gray-900 truncate">{originalInfo.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('image_format_conversion.original_size') || '大小'}:</span>
                    <p className="font-medium text-gray-900">{originalInfo.size}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('image_format_conversion.original_dimensions') || '尺寸'}:</span>
                    <p className="font-medium text-gray-900">{originalInfo.width} x {originalInfo.height}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('image_format_conversion.original_format') || '格式'}:</span>
                    <p className="font-medium text-gray-900">{originalInfo.format}</p>
                  </div>
                </div>
              </div>
            )}

            {!processedImage && !isProcessing && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">{t('image_format_conversion.target_format') || '目标格式'}</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {FORMATS.map(f => (
                        <button
                          key={f.value}
                          onClick={() => setFormat(f.value)}
                          className={`px-4 py-3 rounded-lg border transition ${
                            format === f.value
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'border-gray-300 text-gray-700 hover:border-primary-500'
                          }`}
                        >
                          <div className="font-medium">{f.label}</div>
                          <div className={`text-xs mt-1 ${format === f.value ? 'text-primary-100' : 'text-gray-500'}`}>
                            {f.value === 'png' ? 'PNG' : f.value === 'jpeg' ? 'JPG' : f.value === 'webp' ? 'WebP' : f.value === 'gif' ? 'GIF' : 'BMP'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {format !== 'png' && format !== 'gif' && format !== 'bmp' && (
                    <div>
                      <label className="block text-gray-700 mb-2">
                        {t('image_format_conversion.quality') || '质量'}: {quality}%
                      </label>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{t('image_format_conversion.quality_low') || '低'}</span>
                        <span>{t('image_format_conversion.quality_high') || '高'}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center gap-4">
                  <button onClick={reset} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                    {t('common.clear')}
                  </button>
                  <button onClick={convertImage} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                    {t('image_format_conversion.convert')}
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
                  <span className="text-gray-700">{t('image_format_conversion.processing')}</span>
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

        {processedImage && processedInfo && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t('image_format_conversion.result')}</h3>
            <div className="flex justify-center mb-6">
              <img src={processedImage} alt="Processed" className="max-w-full max-h-80 rounded-lg border border-gray-200" />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-sm mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-500">{t('image_format_conversion.new_size') || '新大小'}:</span>
                  <p className="font-medium text-gray-900">{processedInfo.size}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('image_format_conversion.new_dimensions') || '新尺寸'}:</span>
                  <p className="font-medium text-gray-900">{processedInfo.width} x {processedInfo.height}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('image_format_conversion.new_format') || '新格式'}:</span>
                  <p className="font-medium text-gray-900">{selectedFormat?.label}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={reset} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                {t('common.another')}
              </button>
              <button onClick={handleDownload} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                {t('image_format_conversion.download')}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
