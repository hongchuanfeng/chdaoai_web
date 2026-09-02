'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

interface PDFSplitToolProps {
  toolKey: string
}

type SplitMode = 'range' | 'every' | 'extract'

interface PageRange {
  start: number
  end: number
}

export default function PDFSplitTool({ toolKey }: PDFSplitToolProps) {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [downloadUrls, setDownloadUrls] = useState<{ url: string; name: string }[]>([])
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [splitMode, setSplitMode] = useState<SplitMode>('range')
  const [pageRange, setPageRange] = useState<PageRange>({ start: 1, end: 1 })
  const [everyCount, setEveryCount] = useState(1)
  const [extractPages, setExtractPages] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError(t('pdf_split.invalid_file') || '请选择PDF文件')
        return
      }
      
      setFile(selectedFile)
      setError('')
      setDownloadUrls([])
      
      try {
        const { PDFDocument } = await import('pdf-lib')
        const arrayBuffer = await selectedFile.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const pages = pdfDoc.getPageCount()
        setTotalPages(pages)
        setPageRange({ start: 1, end: Math.min(pages, 10) })
        setEveryCount(Math.ceil(pages / 5))
      } catch (err) {
        console.error('Error reading PDF:', err)
        setError(t('pdf_split.read_error') || '读取PDF文件失败')
      }
    }
  }

  const clearFile = () => {
    setFile(null)
    setDownloadUrls([])
    setError('')
    setProgress(0)
    setTotalPages(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSplit = async () => {
    if (!file) return

    setProcessing(true)
    setError('')
    setProgress(0)

    try {
      const { PDFDocument } = await import('pdf-lib')
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const totalPages = pdfDoc.getPageCount()
      const urls: { url: string; name: string }[] = []

      const fileName = file.name.replace(/\.pdf$/i, '')

      if (splitMode === 'range') {
        const start = Math.max(1, Math.min(pageRange.start, totalPages))
        const end = Math.max(start, Math.min(pageRange.end, totalPages))
        
        if (start > end) {
          setError(t('pdf_split.invalid_range') || '页面范围无效')
          setProcessing(false)
          return
        }

        const newPdf = await PDFDocument.create()
        for (let i = start - 1; i < end; i++) {
          const [page] = await newPdf.copyPages(pdfDoc, [i])
          newPdf.addPage(page)
        }
        
        setProgress(50)
        
        const pdfBytes = await newPdf.save()
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        urls.push({ url, name: `${fileName}_${start}-${end}.pdf` })
        
        setProgress(100)
        
      } else if (splitMode === 'every') {
        const count = Math.max(1, everyCount)
        const numParts = Math.ceil(totalPages / count)
        
        for (let part = 0; part < numParts; part++) {
          setProgress(Math.floor((part / numParts) * 80))
          
          const start = part * count + 1
          const end = Math.min((part + 1) * count, totalPages)
          
          const newPdf = await PDFDocument.create()
          for (let i = start - 1; i < end; i++) {
            const [page] = await newPdf.copyPages(pdfDoc, [i])
            newPdf.addPage(page)
          }
          
          const pdfBytes = await newPdf.save()
          const pdfBlob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
          const url = URL.createObjectURL(pdfBlob)
          urls.push({ url, name: `${fileName}_${start}-${end}.pdf` })
        }
        
        setProgress(100)
        
      } else if (splitMode === 'extract') {
        const pages = extractPages
          .split(/[,，\s]+/)
          .map(p => parseInt(p.trim(), 10))
          .filter(p => !isNaN(p) && p >= 1 && p <= totalPages)
          .sort((a, b) => a - b)
        
        if (pages.length === 0) {
          setError(t('pdf_split.no_valid_pages') || '请输入有效的页面号')
          setProcessing(false)
          return
        }
        
        const newPdf = await PDFDocument.create()
        for (let i = 0; i < pages.length; i++) {
          setProgress(Math.floor((i / pages.length) * 80))
          const [page] = await newPdf.copyPages(pdfDoc, [pages[i] - 1])
          newPdf.addPage(page)
        }
        
        setProgress(90)
        
        const pdfBytes = await newPdf.save()
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        urls.push({ url, name: `${fileName}_extracted.pdf` })
        
        setProgress(100)
      }

      setDownloadUrls(urls)
      
    } catch (err: any) {
      console.error('Split error:', err)
      setError(err.message || t('pdf_split.failed') || '拆分失败')
    }

    setProcessing(false)
  }

  const handleDownloadAll = () => {
    downloadUrls.forEach((item, index) => {
      setTimeout(() => {
        const link = document.createElement('a')
        link.href = item.url
        link.download = item.name
        link.click()
      }, index * 200)
    })
  }

  const handleSplitAnother = () => {
    downloadUrls.forEach(item => URL.revokeObjectURL(item.url))
    setDownloadUrls([])
    setProgress(0)
    clearFile()
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
          {downloadUrls.length === 0 ? (
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
                />
                <div className="cursor-pointer">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-lg text-gray-700 mb-2">
                    {file 
                      ? file.name 
                      : t(`${toolKey.replace(/-/g, '_')}.upload`)
                    }
                  </p>
                  {file && (
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                      {totalPages > 0 && ` • ${totalPages} ${t('pdf_split.pages') || '页'}`}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {t(`${toolKey.replace(/-/g, '_')}.supported`)}
                  </p>
                </div>
              </div>

              {file && totalPages > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">
                      {t('pdf_split.split_mode') || '拆分方式'}
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setSplitMode('range')}
                        className={`p-3 rounded-lg border-2 transition ${
                          splitMode === 'range' 
                            ? 'border-primary-500 bg-primary-50 text-primary-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="text-2xl mb-1">📑</div>
                        <div className="text-sm font-medium">{t('pdf_split.mode_range') || '页面范围'}</div>
                      </button>
                      
                      <button
                        onClick={() => setSplitMode('every')}
                        className={`p-3 rounded-lg border-2 transition ${
                          splitMode === 'every' 
                            ? 'border-primary-500 bg-primary-50 text-primary-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="text-2xl mb-1">✂️</div>
                        <div className="text-sm font-medium">{t('pdf_split.mode_every') || '每N页'}</div>
                      </button>
                      
                      <button
                        onClick={() => setSplitMode('extract')}
                        className={`p-3 rounded-lg border-2 transition ${
                          splitMode === 'extract' 
                            ? 'border-primary-500 bg-primary-50 text-primary-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="text-2xl mb-1">🎯</div>
                        <div className="text-sm font-medium">{t('pdf_split.mode_extract') || '提取页面'}</div>
                      </button>
                    </div>
                  </div>

                  {splitMode === 'range' && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-3">
                        {t('pdf_split.range_title') || '设置页面范围'}
                      </h4>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">
                            {t('pdf_split.start_page') || '起始页'}
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={totalPages}
                            value={pageRange.start}
                            onChange={(e) => setPageRange({ ...pageRange, start: parseInt(e.target.value) || 1 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-700"
                          />
                        </div>
                        <span className="text-gray-500 mt-5">-</span>
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">
                            {t('pdf_split.end_page') || '结束页'}
                          </label>
                          <input
                            type="number"
                            min={pageRange.start}
                            max={totalPages}
                            value={pageRange.end}
                            onChange={(e) => setPageRange({ ...pageRange, end: parseInt(e.target.value) || totalPages })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-700"
                          />
                        </div>
                        <div className="text-sm text-gray-500 mt-5">
                          ({t('pdf_split.total') || '共'} {totalPages} {t('pdf_split.pages') || '页'})
                        </div>
                      </div>
                    </div>
                  )}

                  {splitMode === 'every' && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-3">
                        {t('pdf_split.every_title') || '每N页拆分为一个文件'}
                      </h4>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">
                            {t('pdf_split.every_count') || '每多少页'}
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={totalPages}
                            value={everyCount}
                            onChange={(e) => setEveryCount(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-700"
                          />
                        </div>
                        <div className="text-sm text-gray-500">
                          ({Math.ceil(totalPages / everyCount)} {t('pdf_split.will_create') || '个文件'})
                        </div>
                      </div>
                    </div>
                  )}

                  {splitMode === 'extract' && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-3">
                        {t('pdf_split.extract_title') || '输入要提取的页面'}
                      </h4>
                      <textarea
                        value={extractPages}
                        onChange={(e) => setExtractPages(e.target.value)}
                        placeholder={t('pdf_split.extract_placeholder') || '例如: 1, 3, 5-8, 12'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-700 h-24 resize-none"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        {t('pdf_split.extract_hint') || '使用逗号分隔页面号，支持范围如 1-5'}
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleSplit}
                    disabled={processing}
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 7h4m0 0v4m0-4l-8 8M10 17H6m0 0V7m0 10l8-8" />
                        </svg>
                        {t(`${toolKey.replace(/-/g, '_')}.split`)}
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={clearFile}
                    className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
                  >
                    {t('common.clear')}
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
                  {t('pdf_split.success_title') || '拆分成功'}
                </h3>
                <p className="text-gray-600">
                  {(t('pdf_split.success_desc') || '已拆分为 {count} 个文件').replace('{count}', String(downloadUrls.length))}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-60 overflow-y-auto">
                <ul className="space-y-2">
                  {downloadUrls.map((item, index) => (
                    <li key={index} className="flex justify-between items-center text-sm text-gray-700">
                      <span>{index + 1}. {item.name}</span>
                      <a
                        href={item.url}
                        download={item.name}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {t('pdf_split.download') || '下载'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={handleDownloadAll}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('pdf_split.download_all') || '下载全部'}
                </button>
                
                <button
                  onClick={handleSplitAnother}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  {t('pdf_split.split_another') || '拆分其他文件'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
