'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

interface PDFMergeToolProps {
  toolKey: string
}

interface PDFFile {
  file: File
  name: string
  size: number
}

export default function PDFMergeTool({ toolKey }: PDFMergeToolProps) {
  const { t } = useLanguage()
  const [files, setFiles] = useState<PDFFile[]>([])
  const [processing, setProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files)
        .filter(file => file.name.toLowerCase().endsWith('.pdf'))
        .map(file => ({
          file,
          name: file.name,
          size: file.size
        }))
      setFiles([...files, ...fileArray])
      setError('')
      setDownloadUrl('')
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleClearFiles = () => {
    setFiles([])
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
    const draggedFile = newFiles[draggedIndex]
    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedFile)
    setFiles(newFiles)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      setError(t('pdf_merge.need_more_files') || '请至少上传2个PDF文件')
      return
    }

    setProcessing(true)
    setError('')
    setProgress(0)

    try {
      const { PDFDocument } = await import('pdf-lib')
      
      const mergedPdf = await PDFDocument.create()
      
      for (let i = 0; i < files.length; i++) {
        setProgress(Math.floor((i / files.length) * 80) + 10)
        
        const arrayBuffer = await files[i].file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
        
        for (const page of pages) {
          mergedPdf.addPage(page)
        }
      }
      
      setProgress(90)
      
      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      setDownloadUrl(url)
      setProgress(100)
      
    } catch (err: any) {
      console.error('Merge error:', err)
      setError(err.message || t('pdf_merge.failed') || '合并失败')
    }

    setProcessing(false)
  }

  const handleDownload = () => {
    if (!downloadUrl) return
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = 'merged.pdf'
    link.click()
  }

  const handleMergeAnother = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl)
    }
    setDownloadUrl('')
    setProgress(0)
    handleClearFiles()
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
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                  multiple
                />
                <div className="cursor-pointer">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-lg text-gray-700 mb-2">
                    {files.length > 0 
                      ? `${files.length} ${t('pdf_merge.files_selected') || '个文件已选择'}`
                      : t(`${toolKey.replace(/-/g, '_')}.upload`)
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {t(`${toolKey.replace(/-/g, '_')}.supported`)}
                  </p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-700">
                        {t('pdf_merge.selected_files') || '已选文件'} ({files.length})
                      </h3>
                      <button
                        onClick={handleClearFiles}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        {t('common.clear')}
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-3">
                      {t('pdf_merge.drag_to_reorder') || '拖动文件可以重新排序'}
                    </p>
                    
                    <ul className="space-y-2">
                      {files.map((pdfFile, index) => (
                        <li
                          key={index}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`flex justify-between items-center bg-white px-4 py-3 rounded-lg border ${
                            draggedIndex === index ? 'border-primary-500 opacity-50' : 'border-gray-200'
                          } cursor-move hover:border-primary-400 transition`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-primary-600 font-bold">{index + 1}.</span>
                            <span className="text-gray-700 truncate max-w-xs">{pdfFile.name}</span>
                            <span className="text-gray-400 text-sm">({formatFileSize(pdfFile.size)})</span>
                          </div>
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className="text-gray-400 hover:text-red-500 ml-2"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleMerge}
                    disabled={processing || files.length < 2}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t(`${toolKey.replace(/-/g, '_')}.processing`)} {progress}%
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        {t(`${toolKey.replace(/-/g, '_')}.merge`)}
                      </>
                    )}
                  </button>

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
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('pdf_merge.success_title') || '合并成功'}
                </h3>
                <p className="text-gray-600">
                  {(t('pdf_merge.success_desc') || '已成功合并 {count} 个PDF文件').replace('{count}', String(files.length))}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-600">
                  {files.length} {t('pdf_merge.files_merged') || '个文件已合并'}
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
                  {t('pdf_merge.download') || '下载合并文件'}
                </button>
                
                <button
                  onClick={handleMergeAnother}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  {t('pdf_merge.merge_another') || '合并其他文件'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
