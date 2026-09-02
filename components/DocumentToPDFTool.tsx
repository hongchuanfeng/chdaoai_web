'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

interface DocumentToPDFProps {
  toolKey: string
}

export default function DocumentToPDF({ toolKey }: DocumentToPDFProps) {
  const { t } = useLanguage()
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [downloadFilename, setDownloadFilename] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files
    if (!inputFiles || inputFiles.length === 0) return
    
    const validFiles: File[] = []
    const invalidFiles: string[] = []
    
    for (let i = 0; i < inputFiles.length; i++) {
      const file = inputFiles[i]
      const ext = file.name.toLowerCase().split('.').pop()
      if (['doc', 'docx', 'txt', 'rtf', 'odt', 'html', 'htm', 'md', 'markdown', 'ppt', 'pptx'].includes(ext || '')) {
        validFiles.push(file)
      } else {
        invalidFiles.push(file.name)
      }
    }
    
    if (invalidFiles.length > 0) {
      setError(`${t('document_to_pdf.invalid_files') || 'Invalid files'}: ${invalidFiles.join(', ')}`)
    } else {
      setError('')
    }
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
      setDownloadUrl('')
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setDownloadUrl('')
  }

  const clearFiles = () => {
    setFiles([])
    setDownloadUrl('')
    setError('')
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleConvertToPDF = async () => {
    if (files.length === 0) return
    
    setProcessing(true)
    setError('')
    setProgress(0)
    setDownloadUrl('')

    try {
      // Dynamically import html2canvas and jsPDF
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ])
      const html2canvas = html2canvasModule.default
      const { jsPDF } = jsPDFModule
      
      // Process each file
      const allText: { name: string; text: string }[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setProgress(Math.floor((i / files.length) * 40))
        
        let text = ''
        const ext = file.name.toLowerCase().split('.').pop()
        
        if (ext === 'txt' || ext === 'rtf') {
          text = await file.text()
        } else if (ext === 'md' || ext === 'markdown') {
          // Markdown to plain text
          const mdText = await file.text()
          text = mdText
            .replace(/#{1,6}\s/g, '') // Remove headers
            .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.+?)\*/g, '$1') // Remove italic
            .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
            .replace(/`(.+?)`/g, '$1') // Remove code
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/^\s*[-*+]\s/gm, '') // Remove list markers
            .replace(/^\s*\d+\.\s/gm, '') // Remove numbered list markers
            .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
        } else if (ext === 'ppt' || ext === 'pptx') {
          // PPT/PPTX - extract text using pptxgenjs
          try {
            const PptxGenJS = await import('pptxgenjs')
            const arrayBuffer = await file.arrayBuffer()
            const pptx = new (PptxGenJS.default as any)()
            await (pptx as any).load(arrayBuffer)
            
            const slides = (pptx as any).slides || []
            const slideTexts: string[] = []
            
            for (const slide of slides) {
              let slideText = ''
              if (slide.text) {
                if (Array.isArray(slide.text)) {
                  slideText = slide.text.map((t: any) => typeof t === 'string' ? t : (t.text || '')).join(' ')
                } else if (typeof slide.text === 'string') {
                  slideText = slide.text
                } else if (typeof slide.text === 'object') {
                  slideText = slide.text.text || ''
                }
              }
              if (slideText) {
                slideTexts.push(`[Slide]\n${slideText}`)
              }
            }
            
            text = slideTexts.join('\n\n')
          } catch (e) {
            console.error('Error extracting text from PPT', file.name, e)
          }
        } else if (ext === 'html' || ext === 'htm') {
          const html = await file.text()
          text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        } else {
          // For doc, docx, odt - extract text
          try {
            if (ext === 'docx') {
              const JSZip = (await import('jszip')).default
              const arrayBuffer = await file.arrayBuffer()
              const zip = await JSZip.loadAsync(arrayBuffer)
              const content = await zip.file('word/document.xml')?.async('string')
              if (content) {
                text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
              }
            }
          } catch (e) {
            console.error('Error extracting text from', file.name, e)
          }
        }
        
        if (text) {
          allText.push({ name: file.name, text })
        }
      }
      
      setProgress(50)
      
      if (allText.length === 0) {
        throw new Error(t('document_to_pdf.no_text') || 'No text could be extracted from the files')
      }
      
      // Create PDF using HTML rendering for better Unicode support
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15
      const contentWidth = pageWidth - 2 * margin
      
      // Create a hidden div for rendering (inset content so it doesn't hug the left edge in PDF)
      const container = document.createElement('div')
      container.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        box-sizing: border-box;
        width: ${contentWidth}mm;
        font-family: "Microsoft YaHei", "SimHei", "Arial Unicode MS", sans-serif;
        font-size: 12px;
        line-height: 1.6;
        color: #333;
        background: white;
        padding: 20px 40px 28px 40px;
      `
      
      // Add title
      const titleDiv = document.createElement('div')
      titleDiv.style.cssText = `
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #111;
      `
      titleDiv.textContent = t('document_to_pdf.title') || 'Converted Document'
      container.appendChild(titleDiv)
      
      // Add metadata
      const metaDiv = document.createElement('div')
      metaDiv.style.cssText = `
        font-size: 10px;
        color: #666;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ddd;
      `
      metaDiv.textContent = `Generated: ${new Date().toLocaleString()}`
      container.appendChild(metaDiv)
      
      // Add document content
      for (const item of allText) {
        const fileHeader = document.createElement('div')
        fileHeader.style.cssText = `
          font-size: 13px;
          font-weight: bold;
          color: #222;
          margin-top: 15px;
          margin-bottom: 8px;
        `
        fileHeader.textContent = `📄 ${item.name}`
        container.appendChild(fileHeader)
        
        const contentDiv = document.createElement('div')
        contentDiv.style.cssText = `
          font-size: 11px;
          line-height: 1.8;
          color: #444;
          white-space: pre-wrap;
          word-break: break-word;
        `
        contentDiv.textContent = item.text
        container.appendChild(contentDiv)
        
        // Add page break between documents
        const breakDiv = document.createElement('div')
        breakDiv.style.cssText = `
          page-break-after: always;
          height: 1px;
        `
        container.appendChild(breakDiv)
      }
      
      document.body.appendChild(container)
      
      setProgress(60)
      
      // Render HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      document.body.removeChild(container)
      
      setProgress(75)
      
      // Calculate how many pages we need
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const pageCount = Math.ceil(imgHeight / pageHeight)
      
      // Add pages to PDF
      for (let i = 0; i < pageCount; i++) {
        if (i > 0) {
          doc.addPage()
        }
        const yOffset = -i * pageHeight
        doc.addImage(imgData, 'JPEG', 0, yOffset, imgWidth, imgHeight)
      }
      
      setProgress(90)
      
      // Save PDF
      const pdfBlob = doc.output('blob')
      const url = URL.createObjectURL(pdfBlob)
      setDownloadUrl(url)
      
      const baseName = files.length === 1 
        ? files[0].name.replace(/\.[^/.]+$/, '')
        : `converted_documents`
      setDownloadFilename(`${baseName}.pdf`)
      
      setProgress(100)
      setProcessing(false)
      
    } catch (err: any) {
      console.error('Conversion error:', err)
      setError(err.message || t('document_to_pdf.failed') || 'Conversion failed')
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

  const handleConvertAnother = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl)
    }
    setDownloadUrl('')
    clearFiles()
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
              <label className="block">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".doc,.docx,.txt,.rtf,.odt,.html,.htm,.md,.markdown,.ppt,.pptx"
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition cursor-pointer">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-lg text-gray-700 mb-2">
                    {t(`${toolKey.replace(/-/g, '_')}.upload`)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {t(`${toolKey.replace(/-/g, '_')}.supported`)}
                  </p>
                </div>
              </label>

              {files.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">
                      {t('document_to_pdf.selected_files') || 'Selected Files'} ({files.length})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                          <div className="flex items-center space-x-2 overflow-hidden">
                            <span className="text-sm">📄</span>
                            <span className="text-sm text-gray-700 truncate">{file.name}</span>
                            <span className="text-xs text-gray-400">({formatFileSize(file.size)})</span>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 text-sm ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleConvertToPDF}
                    disabled={processing || files.length === 0}
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
                      t(`${toolKey.replace(/-/g, '_')}.convert`)
                    )}
                  </button>
                  
                  <button
                    onClick={clearFiles}
                    className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
                  >
                    {t('common.clear')}
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mt-4">
                  {error}
                </div>
              )}

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
            <div className="text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('document_to_pdf.success_title') || 'Conversion Complete'}
                </h3>
                <p className="text-gray-600">
                  {t('document_to_pdf.success_desc') || 'Your document has been converted to PDF'}
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
                  {t('document_to_pdf.download') || 'Download PDF'}
                </button>
                
                <button
                  onClick={handleConvertAnother}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  {t('document_to_pdf.convert_another') || 'Convert Another'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
