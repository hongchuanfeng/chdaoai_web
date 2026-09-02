'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

interface PDFDeduplicateToolProps {
  toolKey: string
}

interface PageInfo {
  pageIndex: number
  hash: string
  thumbnail: string
  isDuplicate: boolean
  duplicateGroup: number
  selected: boolean
}

// Define pdfjs types
interface PDFJSModule {
  GlobalWorkerOptions: { workerSrc: string }
  getDocument: (options: { data: Uint8Array }) => { promise: Promise<PDFDocument> }
}

interface PDFDocument {
  numPages: number
  getPage: (num: number) => Promise<PDFPage>
}

interface PDFPage {
  getViewport: (options: { scale: number }) => { width: number; height: number }
  render: (context: { canvasContext: CanvasRenderingContext2D; viewport: any }) => { promise: Promise<void> }
}

export default function PDFDeduplicateTool({ toolKey }: PDFDeduplicateToolProps) {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [pages, setPages] = useState<PageInfo[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const computeImageHash = (imageData: ImageData): string => {
    const data = imageData.data
    let hash = 0
    const step = 16
    for (let i = 0; i < data.length; i += step * 4) {
      const gray = ((data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0)
      hash = ((hash << 5) - hash + gray) | 0
    }
    return hash.toString(16)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError(t('pdf_deduplicate.invalid_file') || '请选择PDF文件')
        return
      }
      
      setFile(selectedFile)
      setError('')
      setDownloadUrl('')
      setPages([])
      setProgress(0)
      
      await analyzePDF(selectedFile)
    }
  }

  const analyzePDF = async (pdfFile: File) => {
    setProcessing(true)
    setProgress(0)
    
    try {
      const arrayBuffer = await pdfFile.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      // Load pdfjs from CDN
      const pdfjsLib = await loadPdfJs()
      
      // Set worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      
      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
      })
      
      const pdf = await loadingTask.promise
      const pageCount = pdf.numPages
      setTotalPages(pageCount)
      
      const pageInfos: PageInfo[] = []
      const hashMap = new Map<string, number>()
      let groupCounter = 0
      
      for (let i = 1; i <= pageCount; i++) {
        setProgress(Math.floor((i / pageCount) * 80))
        
        const page = await pdf.getPage(i)
        const scale = 0.5
        const viewport = page.getViewport({ scale })
        
        const canvas = document.createElement('canvas')
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        const ctx = canvas.getContext('2d')
        
        if (ctx) {
          await page.render({
            canvasContext: ctx,
            viewport: viewport,
          }).promise
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const hash = computeImageHash(imageData)
          const thumbnail = canvas.toDataURL('image/jpeg', 0.5)
          
          let isDuplicate = false
          let duplicateGroup = -1
          let selected = false
          
          if (hashMap.has(hash)) {
            isDuplicate = true
            duplicateGroup = hashMap.get(hash)!
            selected = true
          } else {
            hashMap.set(hash, groupCounter)
            groupCounter++
          }
          
          pageInfos.push({
            pageIndex: i,
            hash: hash,
            thumbnail,
            isDuplicate,
            duplicateGroup,
            selected,
          })
        }
      }
      
      setPages(pageInfos)
      setProgress(100)
      
    } catch (err) {
      console.error('Error analyzing PDF:', err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(t('pdf_deduplicate.analyze_error') || '分析PDF文件失败: ' + errorMessage)
    }
    
    setProcessing(false)
  }

  const togglePageSelection = (index: number) => {
    setPages(prevPages => {
      const newPages = [...prevPages]
      newPages[index] = { ...newPages[index], selected: !newPages[index].selected }
      return newPages
    })
  }

  const selectAllDuplicates = () => {
    setPages(prevPages => {
      const newPages = prevPages.map(p => ({ ...p, selected: false }))
      const groups = new Map<number, number[]>()
      
      prevPages.forEach((page, idx) => {
        if (page.isDuplicate) {
          const existing = groups.get(page.duplicateGroup) || []
          existing.push(idx)
          groups.set(page.duplicateGroup, existing)
        }
      })
      
      groups.forEach((indices) => {
        indices.slice(1).forEach(idx => {
          newPages[idx].selected = true
        })
      })
      
      return newPages
    })
  }

  const clearFile = () => {
    setFile(null)
    setPages([])
    setDownloadUrl('')
    setError('')
    setProgress(0)
    setTotalPages(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeduplicate = async () => {
    if (!file || pages.length === 0) return
    
    const pagesToRemove = pages
      .filter(p => p.selected)
      .map(p => p.pageIndex - 1)
    
    if (pagesToRemove.length === 0) {
      setError(t('pdf_deduplicate.no_selection') || '请选择要删除的页面')
      return
    }
    
    setProcessing(true)
    setError('')
    setProgress(0)
    
    try {
      const { PDFDocument } = await import('pdf-lib')
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      
      const pagesToRemoveSet = new Set(pagesToRemove.sort((a, b) => b - a))
      
      for (const pageIndex of pagesToRemoveSet) {
        pdfDoc.removePage(pageIndex)
      }
      
      setProgress(80)
      
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      setDownloadUrl(url)
      setProgress(100)
      
    } catch (err: any) {
      console.error('Deduplicate error:', err)
      setError(err.message || t('pdf_deduplicate.failed') || '去重失败')
    }
    
    setProcessing(false)
  }

  const handleDownload = () => {
    if (!downloadUrl) return
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = file?.name.replace(/\.pdf$/i, '_deduplicated.pdf') || 'deduplicated.pdf'
    link.click()
  }

  const handleProcessAnother = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl)
    }
    setDownloadUrl('')
    clearFile()
  }

  const duplicateCount = pages.filter(p => p.isDuplicate).length
  const selectedCount = pages.filter(p => p.selected).length

  return (
    <div className="py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                />
                <div className="cursor-pointer">
                  <div className="text-5xl mb-3">📄</div>
                  <p className="text-lg text-gray-700 mb-1">
                    {file 
                      ? file.name 
                      : t(`${toolKey.replace(/-/g, '_')}.upload`)
                    }
                  </p>
                  {file && (
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • {totalPages} {t('pdf_deduplicate.pages') || '页'}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {t(`${toolKey.replace(/-/g, '_')}.supported`)}
                  </p>
                </div>
              </div>

              {processing && (
                <div className="mt-4">
                  <div className="flex justify-center mb-2">
                    <span className="text-sm text-gray-600">
                      {t('pdf_deduplicate.analyzing') || '正在分析页面...'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {pages.length > 0 && !processing && (
                <div className="mt-6">
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center flex-wrap gap-3">
                      <div>
                        <span className="font-semibold text-gray-800">
                          {duplicateCount > 0 
                            ? `${t('pdf_deduplicate.found_duplicates') || '发现'} ${duplicateCount} ${t('pdf_deduplicate.duplicate_pages') || '个重复页面'}`
                            : t('pdf_deduplicate.no_duplicates') || '未发现重复页面'
                          }
                        </span>
                        {duplicateCount > 0 && (
                          <span className="text-gray-600 ml-2">
                            ({t('pdf_deduplicate.will_remove') || '将删除'} {selectedCount})
                          </span>
                        )}
                      </div>
                      {duplicateCount > 0 && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => selectAllDuplicates()}
                            className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                          >
                            {t('pdf_deduplicate.select_all') || '自动选择'}
                          </button>
                          <button
                            onClick={() => {
                              setPages(prev => prev.map(p => ({ ...p, selected: false })))
                            }}
                            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            {t('common.clear')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[500px] overflow-y-auto p-2">
                    {pages.map((page, index) => (
                      <div
                        key={index}
                        className={`relative rounded-lg border-2 transition cursor-pointer ${
                          page.selected 
                            ? 'border-red-500 bg-red-50' 
                            : page.isDuplicate 
                              ? 'border-yellow-400 bg-yellow-50' 
                              : 'border-gray-200 bg-gray-50 hover:border-primary-400'
                        }`}
                        onClick={() => page.isDuplicate && togglePageSelection(index)}
                      >
                        <div className="aspect-[3/4] bg-white rounded-t-lg overflow-hidden">
                          <img 
                            src={page.thumbnail} 
                            alt={`Page ${page.pageIndex}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="p-2 text-center">
                          <span className="text-sm font-medium text-gray-700">
                            {t('pdf_deduplicate.page') || '第'} {page.pageIndex} {t('pdf_deduplicate.page_suffix') || '页'}
                          </span>
                          {page.isDuplicate && (
                            <span className="block text-xs text-yellow-600">
                              {t('pdf_deduplicate.duplicate') || '重复'}
                            </span>
                          )}
                        </div>
                        {page.selected && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                            ✕
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-between items-center flex-wrap gap-4">
                    <button
                      onClick={clearFile}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      {t('common.clear')}
                    </button>
                    
                    <button
                      onClick={handleDeduplicate}
                      disabled={processing || selectedCount === 0}
                      className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 flex items-center gap-2"
                    >
                      {processing ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t(`${toolKey.replace(/-/g, '_')}.processing`)}
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {t(`${toolKey.replace(/-/g, '_')}.deduplicate`)} ({selectedCount})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('pdf_deduplicate.success_title') || '去重成功'}
                </h3>
                <p className="text-gray-600">
                  {(t('pdf_deduplicate.success_desc') || '已删除 {count} 个重复页面').replace('{count}', String(selectedCount))}
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
                  {t('pdf_deduplicate.download') || '下载去重文件'}
                </button>
                
                <button
                  onClick={handleProcessAnother}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  {t('pdf_deduplicate.process_another') || '处理其他文件'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Load pdfjs from CDN
async function loadPdfJs(): Promise<PDFJSModule> {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib)
      return
    }
    
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = () => {
      resolve((window as any).pdfjsLib)
    }
    script.onerror = () => {
      reject(new Error('Failed to load PDF.js from CDN'))
    }
    document.head.appendChild(script)
  })
}
