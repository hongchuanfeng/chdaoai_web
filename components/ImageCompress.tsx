'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

export default function ImageCompress() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [compressedSize, setCompressedSize] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [quality, setQuality] = useState(80)
  const [fileName, setFileName] = useState<string>('')
  const [fileType, setFileType] = useState<string>('image/jpeg')
  const [outputFormat, setOutputFormat] = useState<string>('image/jpeg')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const compressImage = (imageSrc: string, qualityValue: number, format: string): Promise<string> => {
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

        ctx.drawImage(img, 0, 0)

        // 使用用户选择的输出格式
        const outputType = format
        const outputQuality = outputType === 'image/png' ? 1 : qualityValue / 100

        const compressedDataUrl = canvas.toDataURL(outputType, outputQuality)
        resolve(compressedDataUrl)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = imageSrc
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 记录原始文件大小
      setOriginalSize(file.size)
      setFileName(file.name)
      setFileType(file.type || 'image/jpeg')
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setProcessedImage(null)
        setCompressedSize(0)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProcess = async () => {
    if (!selectedImage) return

    setIsProcessing(true)

    try {
      const compressed = await compressImage(selectedImage, quality, outputFormat)
      setProcessedImage(compressed)

      // 计算压缩后的大小
      const base64Data = compressed.split(',')[1]
      const compressedSizeBytes = Math.round((base64Data.length * 3) / 4)
      setCompressedSize(compressedSizeBytes)
    } catch (error) {
      console.error('Compression failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processedImage) return

    // 根据用户选择的输出格式确定扩展名
    let extension = 'jpg'
    if (outputFormat === 'image/png') {
      extension = 'png'
    } else if (outputFormat === 'image/webp') {
      extension = 'webp'
    }

    // 移除原始文件扩展名，添加压缩后的扩展名
    const originalNameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
    const downloadName = `${originalNameWithoutExt}_compressed.${extension}`

    const link = document.createElement('a')
    link.download = downloadName
    link.href = processedImage
    link.click()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getCompressionRatio = (): string => {
    if (originalSize === 0 || compressedSize === 0) return ''
    const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1)
    return `${ratio}%`
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('nav.image_compress')}</h1>
        <p className="text-lg text-gray-600">{t('image_compress.description')}</p>
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
            <p className="mt-4 text-lg text-gray-600">{t('image_compress.upload')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('image_compress.supported')}</p>
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
            
            <div className="flex items-center justify-center gap-4">
              <label className="text-gray-700">{t('image_compress.quality')}:</label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-48"
              />
              <span className="text-gray-600">{quality}%</span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <label className="text-gray-700">{t('image_compress.output_format') || 'Output Format'}:</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                <option value="image/jpeg">{t('image_compress.format_jpg') || 'JPEG (.jpg)'}</option>
                <option value="image/png">{t('image_compress.format_png') || 'PNG (.png)'}</option>
                <option value="image/webp">{t('image_compress.format_webp') || 'WebP (.webp)'}</option>
              </select>
            </div>

            <div className="text-center text-gray-600">
              <p>{t('image_compress.original')}: {formatFileSize(originalSize)}</p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => { setSelectedImage(null); setProcessedImage(null); setOriginalSize(0); setCompressedSize(0); }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                {t('common.clear')}
              </button>
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {isProcessing ? t('image_compress.processing') : t('image_compress.compress')}
              </button>
            </div>
          </div>
        )}

        {processedImage && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t('image_compress.result')}</h3>
            <div className="flex justify-center mb-6">
              <img src={processedImage} alt="Processed" className="max-w-full max-h-96 rounded-lg" />
            </div>
            <div className="text-center text-gray-600 mb-6">
              <p>{t('image_compress.compressed')}: {formatFileSize(compressedSize)}</p>
              {getCompressionRatio() && (
                <p className="text-green-600 font-semibold">{t('image_compress.saved')}: {getCompressionRatio()}</p>
              )}
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                {t('image_compress.download')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

