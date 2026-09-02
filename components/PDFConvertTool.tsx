'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

interface PDFConvertToolProps {
  toolKey: string
}

type OutputFormat = 'png' | 'jpg' | 'txt' | 'docx' | 'xlsx' | 'pptx' | 'html' | 'markdown'

interface ConvertedFile {
  name: string
  url: string
  type: string
}

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
  getTextContent: () => Promise<{ items: Array<{ str: string }> }>
}

async function loadPdfJs(): Promise<PDFJSModule> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
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

export default function PDFConvertTool({ toolKey }: PDFConvertToolProps) {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('png')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const selectedFile = files[0]
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError(t('pdf_convert.invalid_file') || 'Please select a PDF file')
      return
    }
    
    setFile(selectedFile)
    setError('')
    setConvertedFiles([])
    setProgress(0)
  }

  const handleClear = () => {
    setFile(null)
    setConvertedFiles([])
    setError('')
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const canvasToBlob = (canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob from canvas'))
        }
      }, mimeType, quality)
    })
  }

  const convertToImages = async (pdfDoc: PDFDocument, baseName: string, format: 'png' | 'jpg') => {
    const results: ConvertedFile[] = []
    
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      setProgress(Math.floor((i / pdfDoc.numPages) * 90))
      
      const page = await pdfDoc.getPage(i)
      const scale = 2
      const viewport = page.getViewport({ scale })
      
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Failed to get canvas context')
      
      canvas.width = viewport.width
      canvas.height = viewport.height
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise
      
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
      const extension = format === 'png' ? 'png' : 'jpg'
      const quality = format === 'jpg' ? 0.92 : undefined
      
      const blob = await canvasToBlob(canvas, mimeType, quality)
      const url = URL.createObjectURL(blob)
      
      results.push({
        name: `${baseName}_page_${i}.${extension}`,
        url,
        type: mimeType
      })
    }
    
    return results
  }

  const extractTextFromPDF = async (pdfDoc: PDFDocument, baseName: string) => {
    let fullText = ''
    
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      setProgress(Math.floor((i / pdfDoc.numPages) * 90))
      const page = await pdfDoc.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ')
      fullText += `--- Page ${i} ---\n${pageText}\n\n`
    }
    
    const blob = new Blob([fullText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    return [{
      name: `${baseName}.txt`,
      url,
      type: 'text/plain'
    }]
  }

  const convertToDocx = async (pdfDoc: PDFDocument, baseName: string) => {
    let fullText = ''
    
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      setProgress(Math.floor((i / pdfDoc.numPages) * 70))
      const page = await pdfDoc.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ')
      fullText += `Page ${i}\n${pageText}\n\n`
    }
    
    setProgress(85)
    
    const { Document, Packer, Paragraph, TextRun } = await import('docx')
    const paragraphs = fullText.split('\n\n').filter(line => line.trim()).map(line => 
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            size: 24,
          }),
        ],
      })
    )
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    })
    
    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    
    return [{
      name: `${baseName}.docx`,
      url,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }]
  }

  const convertToXlsx = async (pdfDoc: PDFDocument, baseName: string) => {
    let fullText = ''
    
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      setProgress(Math.floor((i / pdfDoc.numPages) * 70))
      const page = await pdfDoc.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ')
      fullText += `Page ${i}:\n${pageText}\n\n`
    }
    
    setProgress(85)
    
    const ExcelJS = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('PDF Content')
    
    const lines = fullText.split('\n').filter(line => line.trim())
    const dataRows: string[][] = []
    
    lines.forEach((line) => {
      if (line.startsWith('Page ')) {
        dataRows.push([line])
      } else {
        const words = line.split(/\s+/)
        if (words.length > 0) {
          dataRows.push(words)
        }
      }
    })
    
    dataRows.forEach((row) => {
      worksheet.addRow(row)
    })
    
    const blob = await workbook.xlsx.writeBuffer()
    const uint8Array = new Uint8Array(blob as unknown as ArrayBuffer)
    const blobResult = new Blob([uint8Array], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blobResult)
    
    return [{
      name: `${baseName}.xlsx`,
      url,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }]
  }

  const convertToPptx = async (pdfDoc: PDFDocument, baseName: string) => {
    let fullText = ''
    
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      setProgress(Math.floor((i / pdfDoc.numPages) * 70))
      const page = await pdfDoc.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ')
      fullText += `${pageText}\n`
    }
    
    setProgress(85)
    
    const PptxGenJS = await import('pptxgenjs')
    const pptx = new (PptxGenJS.default as any)()
    
    const textBlocks = fullText.split('\n').filter(block => block.trim())
    const blocksPerSlide = 6
    
    for (let i = 0; i < textBlocks.length; i += blocksPerSlide) {
      const slide = pptx.addSlide()
      const blockGroup = textBlocks.slice(i, i + blocksPerSlide)
      
      blockGroup.forEach((text: string, index: number) => {
        slide.addShape('rect', {
          x: 0.5,
          y: 0.5 + index * 1.2,
          w: 9,
          h: 1,
          fill: { color: 'F5F5F5' },
          line: { color: 'CCCCCC', width: 0.5 }
        })
        
        slide.addText(text.substring(0, 100), {
          x: 0.6,
          y: 0.6 + index * 1.2,
          w: 8.8,
          h: 0.8,
          fontSize: 14,
          color: '333333'
        })
      })
    }
    
    const blob = await (pptx as any).write('blob')
    const url = URL.createObjectURL(blob)
    
    return [{
      name: `${baseName}.pptx`,
      url,
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    }]
  }

  const convertToHtml = async (pdfDoc: PDFDocument, baseName: string) => {
    let htmlContent = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>PDF Content</title>\n<style>\nbody { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }\nh1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }\n.page { margin-bottom: 40px; background: #f9f9f9; padding: 20px; border-radius: 8px; }\n.page-title { color: #007bff; font-size: 1.5em; margin-bottom: 15px; }\np { line-height: 1.6; color: #444; }\n</style>\n</head>\n<body>\n<h1>PDF Content</h1>\n'
    
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      setProgress(Math.floor((i / pdfDoc.numPages) * 80))
      const page = await pdfDoc.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item) => {
          const text = item.str
          return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        })
        .join(' ')
      
      htmlContent += `<div class="page">\n<div class="page-title">Page ${i}</div>\n<p>${pageText}</p>\n</div>\n`
    }
    
    htmlContent += '</body>\n</html>'
    
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    
    return [{
      name: `${baseName}.html`,
      url,
      type: 'text/html'
    }]
  }

  const convertToMarkdown = async (pdfDoc: PDFDocument, baseName: string) => {
    let markdownContent = '# PDF Content\n\n'
    
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      setProgress(Math.floor((i / pdfDoc.numPages) * 80))
      const page = await pdfDoc.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ')
      
      markdownContent += `## Page ${i}\n\n${pageText}\n\n---\n\n`
    }
    
    const blob = new Blob([markdownContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    
    return [{
      name: `${baseName}.md`,
      url,
      type: 'text/markdown'
    }]
  }

  const handleConvert = async () => {
    if (!file) return
    
    setProcessing(true)
    setError('')
    setProgress(0)
    setConvertedFiles([])
    
    try {
      const pdfjsLib = await loadPdfJs()
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array })
      const pdfDoc = await loadingTask.promise
      const baseName = file.name.replace('.pdf', '')
      
      let results: ConvertedFile[] = []
      
      switch (selectedFormat) {
        case 'png':
        case 'jpg':
          results = await convertToImages(pdfDoc, baseName, selectedFormat)
          break
        case 'txt':
          results = await extractTextFromPDF(pdfDoc, baseName)
          break
        case 'docx':
          results = await convertToDocx(pdfDoc, baseName)
          break
        case 'xlsx':
          results = await convertToXlsx(pdfDoc, baseName)
          break
        case 'pptx':
          results = await convertToPptx(pdfDoc, baseName)
          break
        case 'html':
          results = await convertToHtml(pdfDoc, baseName)
          break
        case 'markdown':
          results = await convertToMarkdown(pdfDoc, baseName)
          break
        default:
          throw new Error('Unsupported format')
      }
      
      setConvertedFiles(results)
      setProgress(100)
    } catch (err: any) {
      console.error('Convert error:', err)
      setError(err.message || t('pdf_convert.failed') || 'Conversion failed: ' + (err.message || 'Unknown error'))
    }
    
    setProcessing(false)
  }

  const handleDownload = (convertedFile: ConvertedFile) => {
    const link = document.createElement('a')
    link.href = convertedFile.url
    link.download = convertedFile.name
    link.click()
  }

  const handleDownloadAll = () => {
    convertedFiles.forEach((file, index) => {
      setTimeout(() => {
        handleDownload(file)
      }, index * 200)
    })
  }

  const handleConvertAnother = () => {
    convertedFiles.forEach(f => URL.revokeObjectURL(f.url))
    setConvertedFiles([])
    handleClear()
  }

  const formatOptions = [
    { value: 'png', label: t('pdf_convert.format_png') || 'PNG Images', icon: '🖼️', desc: t('pdf_convert.format_png_desc') },
    { value: 'jpg', label: t('pdf_convert.format_jpg') || 'JPG Images', icon: '📷', desc: t('pdf_convert.format_jpg_desc') },
    { value: 'txt', label: t('pdf_convert.format_txt') || 'Text File', icon: '📝', desc: t('pdf_convert.format_txt_desc') },
    { value: 'docx', label: t('pdf_convert.format_docx') || 'Word Document', icon: '📄', desc: t('pdf_convert.format_docx_desc') },
    { value: 'xlsx', label: t('pdf_convert.format_xlsx') || 'Excel Spreadsheet', icon: '📊', desc: t('pdf_convert.format_xlsx_desc') },
    { value: 'pptx', label: t('pdf_convert.format_pptx') || 'PowerPoint', icon: '📽️', desc: t('pdf_convert.format_pptx_desc') },
    { value: 'html', label: t('pdf_convert.format_html') || 'HTML File', icon: '🌐', desc: t('pdf_convert.format_html_desc') },
    { value: 'markdown', label: t('pdf_convert.format_markdown') || 'Markdown', icon: '📋', desc: t('pdf_convert.format_markdown_desc') },
  ]

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
          {!convertedFiles.length ? (
            <>
              <label className="block">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition cursor-pointer">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-lg text-gray-700 mb-2">
                    {file ? file.name : t(`${toolKey.replace(/-/g, '_')}.upload`)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {t(`${toolKey.replace(/-/g, '_')}.supported`)}
                  </p>
                  {file && (
                    <p className="text-sm text-gray-400 mt-1">
                      ({formatFileSize(file.size)})
                    </p>
                  )}
                </div>
              </label>

              {file && (
                <div className="mt-6 space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-700 mb-4">
                      {t('pdf_convert.select_format') || 'Select Output Format'}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formatOptions.map((format) => (
                        <button
                          key={format.value}
                          onClick={() => setSelectedFormat(format.value as OutputFormat)}
                          className={`p-4 rounded-lg border-2 transition flex items-center gap-3 ${
                            selectedFormat === format.value
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <span className="text-2xl">{format.icon}</span>
                          <div className="text-left">
                            <p className={`font-medium ${
                              selectedFormat === format.value ? 'text-primary-700' : 'text-gray-700'
                            }`}>
                              {format.label}
                            </p>
                            <p className="text-xs text-gray-500">{format.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleClear}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition"
                    >
                      {t('common.clear') || 'Clear'}
                    </button>
                    <button
                      onClick={handleConvert}
                      disabled={processing}
                      className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {t(`${toolKey.replace(/-/g, '_')}.convert`)}
                        </>
                      )}
                    </button>
                  </div>

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
                  {t('pdf_convert.success_title') || 'Conversion Complete'}
                </h3>
                <p className="text-gray-600">
                  {(t('pdf_convert.success_desc') || 'Successfully converted {count} file(s)').replace('{count}', String(convertedFiles.length))}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-60 overflow-y-auto">
                <ul className="space-y-2">
                  {convertedFiles.map((f, index) => (
                    <li key={index} className="flex items-center justify-between bg-white px-4 py-2 rounded-lg">
                      <span className="text-gray-700 truncate">{f.name}</span>
                      <button
                        onClick={() => handleDownload(f)}
                        className="text-primary-600 hover:text-primary-700 text-sm ml-2"
                      >
                        {t('common.download') || 'Download'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-center gap-4 flex-wrap">
                {convertedFiles.length > 1 && (
                  <button
                    onClick={handleDownloadAll}
                    className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('pdf_convert.download_all') || 'Download All'}
                  </button>
                )}
                
                <button
                  onClick={handleConvertAnother}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  {t('pdf_convert.convert_another') || 'Convert Another File'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
