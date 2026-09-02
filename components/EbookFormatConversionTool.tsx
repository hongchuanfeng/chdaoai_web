'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

interface EbookFormatConversionProps {
  toolKey: string
}

type OutputFormat = 'epub' | 'txt' | 'html'

export default function EbookFormatConversion({ toolKey }: EbookFormatConversionProps) {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [downloadFilename, setDownloadFilename] = useState('')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('epub')
  const [extractedText, setExtractedText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
      setDownloadUrl('')
      setExtractedText('')
    }
  }

  const clearFile = () => {
    setFile(null)
    setDownloadUrl('')
    setError('')
    setProgress(0)
    setExtractedText('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getAcceptedFormats = () => {
    return '.epub,.pdf,.txt,.md,.html,.htm,.mobi,.azw3'
  }

  // Extract text from epub
  const extractTextFromEpub = async (file: File): Promise<string> => {
    const JSZip = (await import('jszip')).default
    const arrayBuffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(arrayBuffer)
    
    let fullText = ''
    const files = zip.files
    
    const xhtmlFiles = Object.keys(files).filter(name => 
      (name.endsWith('.xhtml') || name.endsWith('.html') || name.endsWith('.htm')) &&
      !name.includes('nav') && !name.includes('toc')
    ).sort()
    
    for (const fileName of xhtmlFiles) {
      const content = await zip.file(fileName)?.async('string')
      if (content) {
        const text = content
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&apos;/g, "'")
          .replace(/\s+/g, ' ')
          .trim()
        
        if (text.length > 20) {
          fullText += text + '\n\n'
        }
      }
    }
    
    return fullText.trim()
  }

  // Create EPUB from text
  const createEpubFromText = async (title: string, content: string): Promise<Blob> => {
    const JSZip = (await import('jszip')).default
    
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
    
    const zip = new JSZip()
    
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })
    
    zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`)
    
    const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:uuid:${uuid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>zh-CN</dc:language>
    <meta property="dcterms:modified">${dateStr}T00:00:00Z</meta>
  </metadata>
  <manifest>
    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="style.css" media-type="text/css"/>
  </manifest>
  <spine>
    <itemref idref="chapter1"/>
  </spine>
</package>`
    zip.file('OEBPS/content.opf', contentOpf)
    
    const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <nav epub:type="toc">
    <h1>${escapeXml(title)}</h1>
    <ol>
      <li><a href="chapter1.xhtml">${escapeXml(title)}</a></li>
    </ol>
  </nav>
</body>
</html>`
    zip.file('OEBPS/nav.xhtml', navXhtml)
    
    const css = `body {
  font-family: "Helvetica Neue", Helvetica, Arial, "Microsoft YaHei", "PingFang SC", sans-serif;
  margin: 1em;
  line-height: 1.6;
  text-align: justify;
}
h1, h2, h3, h4, h5, h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  text-align: center;
}
p {
  margin: 0.5em 0;
  text-indent: 2em;
}`
    zip.file('OEBPS/style.css', css)
    
    const paragraphs = content.split(/\n{2,}/).filter(p => p.trim())
    const htmlContent = paragraphs.map(p => `<p>${escapeXml(p.trim())}</p>`).join('\n')
    
    const chapterXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
<h1>${escapeXml(title)}</h1>
${htmlContent}
</body>
</html>`
    zip.file('OEBPS/chapter1.xhtml', chapterXhtml)
    
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/epub+zip',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
      platform: 'DOS'
    }) as Blob
    
    return zipBlob
  }

  // Create HTML from text
  const createHtmlFromText = (title: string, content: string): Blob => {
    const paragraphs = content.split(/\n{2,}/).filter(p => p.trim())
    const htmlContent = paragraphs.map(p => `<p>${escapeXml(p.trim())}</p>`).join('\n')
    
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(title)}</title>
  <style>
    body {
      font-family: "Helvetica Neue", Helvetica, Arial, "Microsoft YaHei", "PingFang SC", sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.8;
      background-color: #f5f5f5;
    }
    h1 {
      text-align: center;
      color: #333;
      border-bottom: 2px solid #ddd;
      padding-bottom: 10px;
    }
    p {
      text-indent: 2em;
      color: #444;
    }
  </style>
</head>
<body>
  <h1>${escapeXml(title)}</h1>
  ${htmlContent}
</body>
</html>`
    
    return new Blob([html], { type: 'text/html' })
  }

  // Escape XML special characters
  const escapeXml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  // Extract text from file
  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase()
    
    try {
      if (fileName.endsWith('.epub')) {
        return await extractTextFromEpub(file)
      } else if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.markdown')) {
        return await file.text()
      } else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
        const text = await file.text()
        return text
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ')
          .trim()
      } else if (fileName.endsWith('.pdf')) {
        try {
          const pdfjsLib = await import('pdfjs-dist')
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
          const arrayBuffer = await file.arrayBuffer()
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          let text = ''
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const content = await page.getTextContent()
            const pageText = content.items.map((item: any) => item.str).join(' ')
            text += pageText + '\n\n'
          }
          return text.trim()
        } catch (pdfErr) {
          console.error('PDF extraction error:', pdfErr)
          return await file.text()
        }
      }
    } catch (err) {
      console.error('Error extracting text:', err)
    }
    
    return ''
  }

  const handleConvert = async () => {
    if (!file) return
    setProcessing(true)
    setError('')
    setProgress(0)
    setDownloadUrl('')

    try {
      setProgress(10)
      
      const fileName = file.name.replace(/\.[^/.]+$/, '')
      const text = await extractTextFromFile(file)
      
      if (!text || text.trim().length === 0) {
        setError(t('ebook_format_conversion.no_content') || '未找到可转换的文本内容')
        setProcessing(false)
        return
      }
      
      setExtractedText(text.substring(0, 500) + (text.length > 500 ? '...' : ''))
      setProgress(40)
      
      let blob: Blob
      let outputExt: string
      
      switch (outputFormat) {
        case 'epub':
          blob = await createEpubFromText(fileName, text)
          outputExt = 'epub'
          break
        case 'html':
          blob = createHtmlFromText(fileName, text)
          outputExt = 'html'
          break
        case 'txt':
        default:
          blob = new Blob([text], { type: 'text/plain' })
          outputExt = 'txt'
      }
      
      setProgress(80)
      
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      setDownloadFilename(`${fileName}.${outputExt}`)
      
      setProgress(100)
      setProcessing(false)
      
    } catch (err: any) {
      console.error('Conversion error:', err)
      setError(err.message || t('ebook_format_conversion.failed') || '转换失败')
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
    setProgress(0)
    setExtractedText('')
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
          {!downloadUrl ? (
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
                />
                <div className="cursor-pointer">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-lg text-gray-700 mb-2">
                    {file 
                      ? file.name 
                      : t(`${toolKey.replace(/-/g, '_')}.upload`)
                    }
                  </p>
                  {file && (
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {t(`${toolKey.replace(/-/g, '_')}.supported`)}
                  </p>
                </div>
              </div>

              {file && (
                <div className="mt-6 space-y-4">
                  {/* Output Format Options */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">
                      {t('ebook_format_conversion.output_format') || '输出格式'}
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setOutputFormat('epub')}
                        className={`p-3 rounded-lg border-2 transition ${
                          outputFormat === 'epub' 
                            ? 'border-primary-500 bg-primary-50 text-primary-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="text-2xl mb-1">📖</div>
                        <div className="text-sm font-medium text-gray-700">EPUB</div>
                      </button>
                      
                      <button
                        onClick={() => setOutputFormat('txt')}
                        className={`p-3 rounded-lg border-2 transition ${
                          outputFormat === 'txt' 
                            ? 'border-primary-500 bg-primary-50 text-primary-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="text-2xl mb-1">📄</div>
                        <div className="text-sm font-medium text-gray-700">TXT</div>
                      </button>
                      
                      <button
                        onClick={() => setOutputFormat('html')}
                        className={`p-3 rounded-lg border-2 transition ${
                          outputFormat === 'html' 
                            ? 'border-primary-500 bg-primary-50 text-primary-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="text-2xl mb-1">🌐</div>
                        <div className="text-sm font-medium text-gray-700">HTML</div>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleConvert}
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
                      t(`${toolKey.replace(/-/g, '_')}.process`)
                    )}
                  </button>
                  
                  <button
                    onClick={clearFile}
                    className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
                  >
                    {t('common.clear')}
                  </button>
                </div>
              )}

              {extractedText && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    {t('ebook_format_conversion.extracted_text') || '提取的文本'}
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {extractedText}
                  </p>
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
                  {t('ebook_format_conversion.success_title') || '转换成功'}
                </h3>
                <p className="text-gray-600">
                  {t('ebook_format_conversion.success_desc') || '文件已转换完成，可以下载了'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">{t('ebook_format_conversion.original_format') || '原始格式'}</p>
                    <p className="font-medium text-gray-700">{file?.name.split('.').pop()?.toUpperCase()}</p>
                  </div>
                  <div className="text-2xl text-gray-400">→</div>
                  <div>
                    <p className="text-sm text-gray-500">{t('ebook_format_conversion.output_format_label') || '输出格式'}</p>
                    <p className="font-medium text-primary-600">{outputFormat.toUpperCase()}</p>
                  </div>
                </div>
              </div>

              {extractedText && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-medium text-gray-700 mb-2">
                    {t('ebook_format_conversion.extracted_text') || '提取的文本'}
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {extractedText}
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={handleDownload}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('ebook_format_conversion.download') || '下载文件'}
                </button>
                
                <button
                  onClick={handleConvertAnother}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  {t('ebook_format_conversion.convert_another') || '转换其他文件'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
