'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

interface ParsedEbook {
  name: string
  size: number
  type: string
  pages?: number
  content?: string
}

export default function EbookMerge() {
  const { t } = useLanguage()
  const [files, setFiles] = useState<File[]>([])
  const [parsedFiles, setParsedFiles] = useState<ParsedEbook[]>([])
  const [processing, setProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [mergedFileName, setMergedFileName] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getAcceptedFormats = () => {
    return '.pdf,.epub,.mobi,.azw3'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileType = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    return ext
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const allFiles = [...files, ...newFiles]
      setFiles(allFiles)
      setError('')
      setDownloadUrl('')

      const parsed: ParsedEbook[] = allFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: getFileType(file.name),
        pages: 1
      }))
      setParsedFiles(parsed)
    }
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    setFiles(newFiles)

    const newParsedFiles = [...parsedFiles]
    newParsedFiles.splice(index, 1)
    setParsedFiles(newParsedFiles)

    setDownloadUrl('')
  }

  const clearFiles = () => {
    setFiles([])
    setParsedFiles([])
    setDownloadUrl('')
    setError('')
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newFiles = [...files]
    const newParsedFiles = [...parsedFiles]

    const draggedFile = newFiles[draggedIndex]
    const draggedParsed = newParsedFiles[draggedIndex]

    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedFile)

    newParsedFiles.splice(draggedIndex, 1)
    newParsedFiles.splice(index, 0, draggedParsed)

    setFiles(newFiles)
    setParsedFiles(newParsedFiles)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleMerge = async () => {
    if (files.length < 2) return
    setProcessing(true)
    setError('')
    setProgress(0)

    try {
      const pdfFiles = files.filter(f => f.name.toLowerCase().endsWith('.pdf'))
      const otherFiles = files.filter(f => !f.name.toLowerCase().endsWith('.pdf'))

      if (pdfFiles.length >= 2) {
        // 使用 pdf-lib 合并 PDF 文件
        const { PDFDocument } = await import('pdf-lib')
        const mergedPdf = await PDFDocument.create()

        for (let i = 0; i < pdfFiles.length; i++) {
          const file = pdfFiles[i]
          const arrayBuffer = await file.arrayBuffer()

          try {
            const pdf = await PDFDocument.load(arrayBuffer)
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
            pages.forEach(page => mergedPdf.addPage(page))
          } catch (pdfError) {
            console.warn(`Could not process ${file.name}:`, pdfError)
          }

          setProgress(Math.round(((i + 1) / pdfFiles.length) * 80))
        }

        setProgress(90)
        const pdfBytes = await mergedPdf.save()
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)

        setDownloadUrl(url)
        setMergedFileName('merged-ebooks.pdf')
      } else if (otherFiles.length > 0 && pdfFiles.length > 0) {
        // 混合文件 - 只处理 PDF
        const { PDFDocument } = await import('pdf-lib')
        const mergedPdf = await PDFDocument.create()

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          if (file.name.toLowerCase().endsWith('.pdf')) {
            const arrayBuffer = await file.arrayBuffer()
            try {
              const pdf = await PDFDocument.load(arrayBuffer)
              const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
              pages.forEach(page => mergedPdf.addPage(page))
            } catch (pdfError) {
              console.warn(`Could not process ${file.name}:`, pdfError)
            }
          }
          setProgress(Math.round(((i + 1) / files.length) * 80))
        }

        if (mergedPdf.getPageCount() > 0) {
          setProgress(90)
          const pdfBytes = await mergedPdf.save()
          const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)
          setDownloadUrl(url)
          setMergedFileName('merged-ebooks.pdf')
        } else {
          throw new Error(t('ebook_merge.only_pdf_supported'))
        }
      } else {
        // 没有 PDF 文件
        throw new Error(t('ebook_merge.only_pdf_supported'))
      }

      setProgress(100)
    } catch (err: any) {
      console.error('Merge error:', err)
      setError(err.message || t('ebook_merge.merge_failed'))
    }

    setProcessing(false)
  }

  const handleDownload = () => {
    if (!downloadUrl) return
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = mergedFileName || 'merged-ebooks.pdf'
    link.click()
  }

  const handleProcessAnother = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl)
    }
    setDownloadUrl('')
    setProgress(0)
    clearFiles()
  }

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('nav.ebook_merge')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('ebook_merge.description')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* 文件上传区域 */}
          {!downloadUrl && (
            <>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={getAcceptedFormats()}
                  onChange={handleFileChange}
                  className="hidden"
                  id="ebook-upload"
                  multiple
                />
                <div className="cursor-pointer">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-lg text-gray-700 mb-2">
                    {files.length > 0
                      ? `${files.length} ${t('ebook_merge.files_selected')}`
                      : t('ebook_merge.upload')
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('ebook_merge.supported')}
                  </p>
                </div>
              </div>

              {/* 文件列表 */}
              {files.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-700">
                      {t('ebook_merge.selected_files')}
                    </h3>
                    <button
                      onClick={clearFiles}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      {t('common.clear')}
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li
                        key={index}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg cursor-move transition ${
                          draggedIndex === index ? 'opacity-50 bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-sm font-medium">
                              {index + 1}
                            </span>
                            <div>
                              <span className="text-sm text-gray-700 block max-w-xs truncate">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                {parsedFiles[index]?.type.toUpperCase()} • {formatFileSize(file.size)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveFile(index)
                          }}
                          className="text-gray-400 hover:text-red-500 ml-2"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">{t('ebook_merge.reorder_hint')}</p>

                  {/* 合并按钮 */}
                  <button
                    onClick={handleMerge}
                    disabled={processing || files.length < 2}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 mt-4 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('ebook_merge.processing')} {progress}%
                      </>
                    ) : (
                      t('ebook_merge.process')
                    )}
                  </button>
                </div>
              )}

              {files.length > 0 && files.length < 2 && (
                <p className="text-center text-gray-500 text-sm mt-4">
                  {t('ebook_merge.min_files')}
                </p>
              )}

              {/* 错误信息 */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mt-4">
                  {error}
                </div>
              )}

              {/* 进度条 */}
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
          )}

          {/* 结果区域 */}
          {downloadUrl && (
            <div className="text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('ebook_merge.success_title')}
                </h3>
                <p className="text-gray-600">
                  {t('ebook_merge.success_desc')}
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDownload}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('ebook_merge.download')}
                </button>
                <button
                  onClick={handleProcessAnother}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  {t('ebook_merge.process_another')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('ebook_merge.how_to_use_title')}
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">1</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('ebook_merge.how_to_use_step1')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('ebook_merge.how_to_use_step1_desc')}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">2</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('ebook_merge.how_to_use_step2')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('ebook_merge.how_to_use_step2_desc')}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">3</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('ebook_merge.how_to_use_step3')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('ebook_merge.how_to_use_step3_desc')}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">4</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('ebook_merge.how_to_use_step4')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('ebook_merge.how_to_use_step4_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('ebook_merge.faq_title')}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ebook_merge.faq_q1')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ebook_merge.faq_a1')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ebook_merge.faq_q2')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ebook_merge.faq_a2')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ebook_merge.faq_q3')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ebook_merge.faq_a3')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ebook_merge.faq_q4')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ebook_merge.faq_a4')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ebook_merge.faq_q5')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ebook_merge.faq_a5')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
