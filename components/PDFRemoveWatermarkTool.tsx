'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState } from 'react'

interface PDFRemoveWatermarkToolProps {
  toolKey: string
}

type RemoveMode = 'auto' | 'text' | 'image'

export default function PDFRemoveWatermarkTool({ toolKey }: PDFRemoveWatermarkToolProps) {
  const { t } = useLanguage()
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [removeMode, setRemoveMode] = useState<RemoveMode>('auto')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [downloadFilename, setDownloadFilename] = useState('')
  const [error, setError] = useState('')
  const [removedCount, setRemovedCount] = useState(0)

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
      setError(t('pdf_remove_watermark.invalid_file') || 'Please select a valid PDF file')
      return
    }

    setPdfFile(selectedFile)
    setDownloadUrl('')
    setError('')
    setRemovedCount(0)
  }

  const handleClear = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl)
    }
    setPdfFile(null)
    setDownloadUrl('')
    setError('')
    setProgress(0)
    setRemovedCount(0)
    const input = document.getElementById('pdf-upload-remove') as HTMLInputElement
    if (input) input.value = ''
  }

  const handleRemoveWatermark = async () => {
    if (!pdfFile) return

    setProcessing(true)
    setError('')
    setProgress(0)
    setDownloadUrl('')

    try {
      const { PDFDocument } = await import('pdf-lib')

      setProgress(10)

      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
      const pages = pdfDoc.getPages()

      setProgress(30)

      let removed = 0
      const pageCount = pages.length

      for (let i = 0; i < pageCount; i++) {
        const page = pages[i]

        // Remove watermark annotations from the page
        const annotations = page.node.Annots()
        if (annotations) {
          const annotsArray: any[] = annotations as any
          if (annotsArray && annotsArray.length > 0) {
            const toRemove: any[] = []
            for (let j = 0; j < annotsArray.length; j++) {
              const annot = annotsArray[j]
              try {
                const subtype = annot.get('Subtype')
                const name = annot.get('T')
                const contents = annot.get('Contents')

                const subtypeName = subtype?.toString?.() || ''
                const nameStr = name?.toString?.() || ''
                const contentsStr = contents?.toString?.() || ''

                const isWatermark =
                  subtypeName.includes('Watermark') ||
                  nameStr.toLowerCase().includes('watermark') ||
                  contentsStr.toLowerCase().includes('watermark')

                if (isWatermark || (subtypeName === 'Stamp' || subtypeName === 'FreeText')) {
                  toRemove.push(annot)
                }
              } catch {
                // skip
              }
            }

            for (const annot of toRemove) {
              try {
                const idx = annotsArray.indexOf(annot)
                if (idx >= 0) {
                  annotsArray.splice(idx, 1)
                  removed++
                }
              } catch {
                // skip
              }
            }
          }
        }

        setProgress(30 + Math.floor((i / pageCount) * 50))
      }

      setProgress(80)

      const modifiedPdfBytes = await pdfDoc.save()
      const blob = new Blob([modifiedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setDownloadUrl(url)
      const baseName = pdfFile.name.replace(/\.pdf$/i, '')
      setDownloadFilename(`${baseName}_cleaned.pdf`)
      setRemovedCount(removed)

      setProgress(100)
      setProcessing(false)

    } catch (err: any) {
      console.error('Remove watermark error:', err)
      setError(err.message || t('pdf_remove_watermark.failed') || 'Failed to remove watermarks')
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
                    {t('pdf_remove_watermark.upload_pdf')}
                  </span>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition">
                    <div className="text-5xl mb-3">📄</div>
                    <p className="text-gray-700">
                      {pdfFile ? pdfFile.name : t('pdf_remove_watermark.click_upload_pdf')}
                    </p>
                    {pdfFile && (
                      <p className="text-sm text-gray-500 mt-1">
                        {formatFileSize(pdfFile.size)}
                      </p>
                    )}
                  </div>
                  <input
                    id="pdf-upload-remove"
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    className="hidden"
                  />
                </label>
              </div>

              {pdfFile && (
                <>
                  {/* Remove Mode Selection */}
                  <div className="mb-6">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">
                      {t('pdf_remove_watermark.remove_mode')}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setRemoveMode('auto')}
                        className={`py-3 px-4 rounded-lg border-2 transition ${
                          removeMode === 'auto'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl block mb-1">✨</span>
                        <span className="text-sm font-medium">{t('pdf_remove_watermark.mode_auto')}</span>
                      </button>
                      <button
                        onClick={() => setRemoveMode('text')}
                        className={`py-3 px-4 rounded-lg border-2 transition ${
                          removeMode === 'text'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl block mb-1">🔤</span>
                        <span className="text-sm font-medium">{t('pdf_remove_watermark.mode_text')}</span>
                      </button>
                      <button
                        onClick={() => setRemoveMode('image')}
                        className={`py-3 px-4 rounded-lg border-2 transition ${
                          removeMode === 'image'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl block mb-1">🖼️</span>
                        <span className="text-sm font-medium">{t('pdf_remove_watermark.mode_image')}</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {removeMode === 'auto' && t('pdf_remove_watermark.mode_auto_desc')}
                      {removeMode === 'text' && t('pdf_remove_watermark.mode_text_desc')}
                      {removeMode === 'image' && t('pdf_remove_watermark.mode_image_desc')}
                    </p>
                  </div>

                  {/* Remove Watermark Button */}
                  <button
                    onClick={handleRemoveWatermark}
                    disabled={processing || !pdfFile}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('pdf_remove_watermark.processing')} {progress}%
                      </>
                    ) : (
                      <>
                        <span>🧹</span>
                        {t('pdf_remove_watermark.remove_watermark')}
                      </>
                    )}
                  </button>

                  {/* Clear Button */}
                  <button
                    onClick={handleClear}
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

              {/* Info Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-700">
                  💡 {t('pdf_remove_watermark.notice')}
                </p>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('pdf_remove_watermark.success_title')}
                </h3>
                <p className="text-gray-600">
                  {t('pdf_remove_watermark.success_desc', { count: removedCount })}
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
                  {t('pdf_remove_watermark.download')}
                </button>

                <button
                  onClick={handleClear}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  {t('pdf_remove_watermark.process_another')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
