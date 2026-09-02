'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState } from 'react'

interface PDFAddWatermarkProps {
  toolKey: string
}

type WatermarkType = 'text' | 'image'
type Position = 'center' | 'diagonal' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export default function PDFAddWatermarkTool({ toolKey }: PDFAddWatermarkProps) {
  const { t } = useLanguage()
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text')
  const [watermarkText, setWatermarkText] = useState('WATERMARK')
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null)
  const [watermarkImagePreview, setWatermarkImagePreview] = useState<string>('')
  const [fontSize, setFontSize] = useState(48)
  const [opacity, setOpacity] = useState(30)
  const [rotation, setRotation] = useState(-45)
  const [position, setPosition] = useState<Position>('diagonal')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [downloadFilename, setDownloadFilename] = useState('')
  const [error, setError] = useState('')

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const selectedFile = files[0]
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError(t('pdf_add_watermark.invalid_file') || 'Please select a valid PDF file')
      return
    }

    setPdfFile(selectedFile)
    setDownloadUrl('')
    setError('')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const selectedFile = files[0]
    setWatermarkImage(selectedFile)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setWatermarkImagePreview(ev.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const getPositionCoordinates = (pageWidth: number, pageHeight: number, imgWidth: number, imgHeight: number) => {
    const margin = 50
    switch (position) {
      case 'center':
        return { x: (pageWidth - imgWidth) / 2, y: (pageHeight - imgHeight) / 2 }
      case 'diagonal':
        return { x: (pageWidth - imgWidth) / 2, y: (pageHeight - imgHeight) / 2 }
      case 'top-left':
        return { x: margin, y: pageHeight - margin - imgHeight }
      case 'top-right':
        return { x: pageWidth - margin - imgWidth, y: pageHeight - margin - imgHeight }
      case 'bottom-left':
        return { x: margin, y: margin }
      case 'bottom-right':
        return { x: pageWidth - margin - imgWidth, y: margin }
      default:
        return { x: (pageWidth - imgWidth) / 2, y: (pageHeight - imgHeight) / 2 }
    }
  }

  const handleAddWatermark = async () => {
    if (!pdfFile) return

    setProcessing(true)
    setError('')
    setProgress(0)
    setDownloadUrl('')

    try {
      const { PDFDocument, rgb, degrees } = await import('pdf-lib')

      setProgress(10)

      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()

      setProgress(30)

      // Embed font for text watermark
      const font = await pdfDoc.embedFont('Helvetica')

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        const normalizedOpacity = opacity / 100

        if (watermarkType === 'text') {
          // Calculate text dimensions
          const textWidth = font.widthOfTextAtSize(watermarkText, fontSize)
          const textHeight = fontSize

          let x: number, y: number

          if (position === 'diagonal') {
            // Diagonal watermark - centered
            x = (width - textWidth) / 2
            y = (height - textHeight) / 2
            page.drawText(watermarkText, {
              x,
              y,
              size: fontSize,
              font,
              color: rgb(0.5, 0.5, 0.5),
              opacity: normalizedOpacity,
              rotate: degrees(rotation),
            })
          } else {
            // Position-based watermark
            const coords = getPositionCoordinates(width, height, textWidth, textHeight)
            x = coords.x
            y = coords.y
            page.drawText(watermarkText, {
              x,
              y,
              size: fontSize,
              font,
              color: rgb(0.5, 0.5, 0.5),
              opacity: normalizedOpacity,
            })
          }
        } else if (watermarkType === 'image' && watermarkImage) {
          // Image watermark
          const imageBytes = await watermarkImage.arrayBuffer()
          let image

          const ext = watermarkImage.name.toLowerCase().split('.').pop()
          if (ext === 'png') {
            image = await pdfDoc.embedPng(imageBytes)
          } else if (['jpg', 'jpeg'].includes(ext || '')) {
            image = await pdfDoc.embedJpg(imageBytes)
          } else if (ext === 'webp') {
            image = await pdfDoc.embedJpg(imageBytes)
          } else {
            continue
          }

          // Scale image to reasonable size (max 200x200)
          const maxSize = 200
          let imgWidth = image.width
          let imgHeight = image.height
          if (imgWidth > maxSize || imgHeight > maxSize) {
            const ratio = Math.min(maxSize / imgWidth, maxSize / imgHeight)
            imgWidth *= ratio
            imgHeight *= ratio
          }

          const coords = getPositionCoordinates(width, height, imgWidth, imgHeight)

          if (position === 'diagonal') {
            page.drawImage(image, {
              x: coords.x,
              y: coords.y,
              width: imgWidth,
              height: imgHeight,
              opacity: normalizedOpacity,
              rotate: degrees(rotation),
            })
          } else {
            page.drawImage(image, {
              x: coords.x,
              y: coords.y,
              width: imgWidth,
              height: imgHeight,
              opacity: normalizedOpacity,
            })
          }
        }

        setProgress(30 + Math.floor((i / pages.length) * 50))
      }

      setProgress(80)

      const modifiedPdfBytes = await pdfDoc.save()
      const blob = new Blob([modifiedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setDownloadUrl(url)
      const baseName = pdfFile.name.replace(/\.pdf$/i, '')
      setDownloadFilename(`${baseName}_watermarked.pdf`)

      setProgress(100)
      setProcessing(false)

    } catch (err: any) {
      console.error('Watermark error:', err)
      setError(err.message || t('pdf_add_watermark.failed') || 'Failed to add watermark')
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!downloadUrl) return
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = downloadFilename
    link.click()
  }

  const handleReset = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl)
    }
    setPdfFile(null)
    setDownloadUrl('')
    setError('')
    setProgress(0)
    setWatermarkImage(null)
    setWatermarkImagePreview('')
    const pdfInput = document.getElementById('pdf-upload-add') as HTMLInputElement
    if (pdfInput) pdfInput.value = ''
    const imgInput = document.getElementById('image-upload-add') as HTMLInputElement
    if (imgInput) imgInput.value = ''
  }

  const getPositionLabel = (pos: Position) => {
    const labels: Record<Position, string> = {
      center: t('pdf_add_watermark.position_center'),
      diagonal: t('pdf_add_watermark.position_diagonal'),
      'top-left': t('pdf_add_watermark.position_top_left'),
      'top-right': t('pdf_add_watermark.position_top_right'),
      'bottom-left': t('pdf_add_watermark.position_bottom_left'),
      'bottom-right': t('pdf_add_watermark.position_bottom_right'),
    }
    return labels[pos]
  }

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t(`nav.${toolKey.replace(/-/g, '_')}`)}
          </h1>
          <p className="text-xl text-gray-600">
            {t(`${toolKey.replace(/-/g, '_')}.description`)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {!downloadUrl ? (
            <>
              {/* PDF Upload */}
              <div className="mb-6">
                <label className="block cursor-pointer">
                  <span className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('pdf_add_watermark.upload_pdf')}
                  </span>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition">
                    <div className="text-5xl mb-3">📄</div>
                    <p className="text-gray-700">
                      {pdfFile ? pdfFile.name : t('pdf_add_watermark.click_upload_pdf')}
                    </p>
                    {pdfFile && (
                      <p className="text-sm text-gray-500 mt-1">
                        {formatFileSize(pdfFile.size)}
                      </p>
                    )}
                  </div>
                  <input
                    id="pdf-upload-add"
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    className="hidden"
                  />
                </label>
              </div>

              {pdfFile && (
                <>
                  {/* Watermark Type Selection */}
                  <div className="mb-6">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">
                      {t('pdf_add_watermark.watermark_type')}
                    </label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setWatermarkType('text')}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                          watermarkType === 'text'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl block mb-1">🔤</span>
                        <span className="text-sm font-medium">{t('pdf_add_watermark.text_watermark')}</span>
                      </button>
                      <button
                        onClick={() => setWatermarkType('image')}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                          watermarkType === 'image'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl block mb-1">🖼️</span>
                        <span className="text-sm font-medium">{t('pdf_add_watermark.image_watermark')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Text Watermark Options */}
                  {watermarkType === 'text' && (
                    <div className="mb-6 space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          {t('pdf_add_watermark.watermark_text')}
                        </label>
                        <input
                          type="text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                          placeholder={t('pdf_add_watermark.enter_watermark_text')}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          {t('pdf_add_watermark.font_size')}: {fontSize}px
                        </label>
                        <input
                          type="range"
                          min="12"
                          max="120"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Image Watermark Options */}
                  {watermarkType === 'image' && (
                    <div className="mb-6">
                      <label className="block cursor-pointer">
                        <span className="text-sm font-medium text-gray-700 mb-2 block">
                          {t('pdf_add_watermark.upload_watermark_image')}
                        </span>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition">
                          {watermarkImagePreview ? (
                            <img
                              src={watermarkImagePreview}
                              alt="Watermark"
                              className="max-h-24 mx-auto"
                            />
                          ) : (
                            <>
                              <div className="text-4xl mb-2">🖼️</div>
                              <p className="text-gray-600 text-sm">
                                {t('pdf_add_watermark.click_upload_image')}
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          id="image-upload-add"
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {/* Common Options */}
                  <div className="mb-6 space-y-4">
                    {/* Position */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        {t('pdf_add_watermark.position')}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['center', 'diagonal', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] as Position[]).map((pos) => (
                          <button
                            key={pos}
                            onClick={() => setPosition(pos)}
                            className={`py-2 px-3 rounded-lg border-2 text-sm transition ${
                              position === pos
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {getPositionLabel(pos)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Opacity */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        {t('pdf_add_watermark.opacity')}: {opacity}%
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={opacity}
                        onChange={(e) => setOpacity(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Rotation (only for diagonal position) */}
                    {position === 'diagonal' && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          {t('pdf_add_watermark.rotation')}: {rotation}°
                        </label>
                        <input
                          type="range"
                          min="-90"
                          max="0"
                          value={rotation}
                          onChange={(e) => setRotation(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Add Watermark Button */}
                  <button
                    onClick={handleAddWatermark}
                    disabled={processing || !pdfFile || (watermarkType === 'image' && !watermarkImage)}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('pdf_add_watermark.processing')} {progress}%
                      </>
                    ) : (
                      <>
                        <span>✏️</span>
                        {t('pdf_add_watermark.add_watermark')}
                      </>
                    )}
                  </button>

                  {/* Clear Button */}
                  <button
                    onClick={handleReset}
                    className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 mt-2"
                  >
                    {t('common.clear')}
                  </button>
                </>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mt-4">
                  {error}
                </div>
              )}

              {/* Progress Bar */}
              {processing && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('pdf_add_watermark.success_title')}
                </h3>
                <p className="text-gray-600">
                  {t('pdf_add_watermark.success_desc')}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  📄 {downloadFilename}
                </p>
              </div>

              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={handleDownload}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('pdf_add_watermark.download')}
                </button>

                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  {t('pdf_add_watermark.add_another')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
