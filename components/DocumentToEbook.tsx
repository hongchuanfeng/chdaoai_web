'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

export default function DocumentToEbook() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getAcceptedFormats = () => {
    return '.txt,.pdf,.md,.markdown,.doc,.docx'
  }

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
    }
  }

  const clearFile = () => {
    setFile(null)
    setDownloadUrl('')
    setError('')
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Parse markdown to HTML
  const parseMarkdown = (text: string): string => {
    let result = text
    
    // Escape HTML
    result = result.replace(/&/g, '&amp;')
    result = result.replace(/</g, '&lt;')
    result = result.replace(/>/g, '&gt;')
    
    // Headers
    result = result.replace(/^###### (.+)$/gm, '<h6>$1</h6>')
    result = result.replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    result = result.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    result = result.replace(/^### (.+)$/gm, '<h3>$1</h3>')
    result = result.replace(/^## (.+)$/gm, '<h2>$1</h2>')
    result = result.replace(/^# (.+)$/gm, '<h1>$1</h1>')
    
    // Bold
    result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    result = result.replace(/__(.+?)__/g, '<strong>$1</strong>')
    
    // Italic
    result = result.replace(/\*(.+?)\*/g, '<em>$1</em>')
    result = result.replace(/_(.+?)_/g, '<em>$1</em>')
    
    // Links
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    
    // Images
    result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1"/>')
    
    // Code blocks
    result = result.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    
    // Inline code
    result = result.replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Blockquotes
    result = result.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    
    // Horizontal rules
    result = result.replace(/^[-*_]{3,}$/gm, '<hr/>')
    
    // Unordered lists
    result = result.replace(/^\s*[-*+] (.+)$/gm, '<li>$1</li>')
    
    // Ordered lists
    result = result.replace(/^\s*\d+\. (.+)$/gm, '<li>$1</li>')
    
    // Paragraphs (lines not already wrapped)
    const lines = result.split('\n')
    result = lines.map(line => {
      line = line.trim()
      if (!line) return ''
      if (line.startsWith('<')) return line
      return `<p>${line}</p>`
    }).join('\n')
    
    return result
  }

  // Convert text content to simple HTML
  const textToHtml = (text: string): string => {
    const paragraphs = text.split(/\n{2,}/).filter(p => p.trim())
    return paragraphs.map(p => `<p>${p.trim()}</p>`).join('\n')
  }

  // Create ePub file
  const createEpub = async (title: string, content: string, author: string = 'Unknown'): Promise<Blob> => {
    try {
      const JSZip = (await import('jszip')).default
      
      // Current date
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      
      // Generate UUID for the book
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
      
      // Create a new JSZip instance
      const zip = new JSZip()
      
      // EPUB 3.0 requires mimetype to be first and uncompressed
      // The exact string "application/epub+zip" with no trailing newline
      zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })
      
      // META-INF/container.xml (required for EPUB)
      zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`)
      
      // OEBPS/content.opf (package document)
      const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:uuid:${uuid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
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
      
      // OEBPS/nav.xhtml (navigation document)
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
      
      // OEBPS/style.css
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
}
blockquote {
  border-left: 3px solid #ccc;
  margin: 1em 0;
  padding-left: 1em;
  color: #666;
}
pre, code {
  background-color: #f5f5f5;
  border-radius: 3px;
  padding: 0.2em 0.4em;
  font-family: monospace;
}
pre {
  padding: 1em;
  overflow-x: auto;
}
a {
  color: #0066cc;
}
img {
  max-width: 100%;
  height: auto;
}
strong {
  font-weight: bold;
}
em {
  font-style: italic;
}
`
      zip.file('OEBPS/style.css', css)
      
      // OEBPS/chapter1.xhtml (main content)
      const chapterXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
${content}
</body>
</html>`
      zip.file('OEBPS/chapter1.xhtml', chapterXhtml)
      
      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/epub+zip',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
        platform: 'DOS'
      }) as Blob
      
      return zipBlob
    } catch (error) {
      console.error('Error creating ePub:', error)
      throw error
    }
  }
  
  // Helper function to escape XML special characters
  const escapeXml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  const handleConvert = async () => {
    if (!file) return
    setProcessing(true)
    setError('')
    setProgress(0)

    try {
      setProgress(10)
      
      const fileName = file.name.replace(/\.[^/.]+$/, '')
      const fileContent = await file.text()
      
      console.log('[DocumentToEbook] ===== DEBUG START =====')
      console.log('[DocumentToEbook] File name:', file.name)
      console.log('[DocumentToEbook] File size:', file.size)
      console.log('[DocumentToEbook] File type:', file.type)
      console.log('[DocumentToEbook] File content length:', fileContent.length)
      console.log('[DocumentToEbook] File content preview:', fileContent.substring(0, 200))
      console.log('[DocumentToEbook] File content preview (full lines):', JSON.stringify(fileContent.substring(0, 200)))
      
      setProgress(20)
      
      const ext = file.name.toLowerCase().split('.').pop()
      console.log('[DocumentToEbook] File extension:', ext)
      let htmlContent = ''
      
      // Handle different file types
      if (ext === 'md' || ext === 'markdown') {
        console.log('[DocumentToEbook] Parsing as Markdown')
        htmlContent = parseMarkdown(fileContent)
      } else if (ext === 'docx') {
        console.log('[DocumentToEbook] Parsing as DOCX')
        try {
          const mammoth = await import('mammoth')
          const arrayBuffer = await file.arrayBuffer()
          const result = await mammoth.convertToHtml({ arrayBuffer })
          htmlContent = result.value
        } catch (mammothError) {
          console.error('[DocumentToEbook] Mammoth error:', mammothError)
          htmlContent = textToHtml(fileContent)
        }
      } else if (ext === 'pdf') {
        console.log('[DocumentToEbook] Parsing as PDF')
        // For PDF, we'll use raw text extraction
        htmlContent = textToHtml(fileContent)
      } else {
        // Plain text, etc.
        console.log('[DocumentToEbook] Parsing as plain text')
        console.log('[DocumentToEbook] Before textToHtml, content length:', fileContent.length)
        htmlContent = textToHtml(fileContent)
        console.log('[DocumentToEbook] After textToHtml, HTML length:', htmlContent.length)
        console.log('[DocumentToEbook] After textToHtml, HTML preview:', htmlContent.substring(0, 200))
      }
      
      console.log('[DocumentToEbook] Final HTML content length:', htmlContent.length)
      console.log('[DocumentToEbook] Final HTML content:', htmlContent.substring(0, 300))
      
      if (!htmlContent || htmlContent.trim().length === 0) {
        console.log('[DocumentToEbook] ERROR: HTML content is empty!')
        throw new Error(t('document_to_ebook.no_content'))
      }
      
      setProgress(50)
      
      // Create ePub
      console.log('[DocumentToEbook] Creating ePub...')
      const epubBlob = await createEpub(fileName, htmlContent)
      console.log('[DocumentToEbook] ePub created, size:', epubBlob.size)
      
      setProgress(90)
      
      const url = URL.createObjectURL(epubBlob)
      setDownloadUrl(url)
      
      setProgress(100)
      console.log('[DocumentToEbook] ===== DEBUG END =====')
    } catch (err: any) {
      console.error('[DocumentToEbook] Conversion error:', err)
      setError(err.message || t('document_to_ebook.convert_failed'))
    }

    setProcessing(false)
  }

  const handleDownload = () => {
    if (!downloadUrl) return
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = (file?.name.replace(/\.[^/.]+$/, '') || 'document') + '.epub'
    link.click()
  }

  const handleConvertAnother = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl)
    }
    setDownloadUrl('')
    setProgress(0)
    clearFile()
  }

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('nav.document_to_ebook')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('document_to_ebook.description')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
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
                  id="document-upload"
                />
                <div className="cursor-pointer">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-lg text-gray-700 mb-2">
                    {file 
                      ? file.name 
                      : t('document_to_ebook.upload')
                    }
                  </p>
                  {file && (
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {t('document_to_ebook.supported')}
                  </p>
                </div>
              </div>

              {file && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-700">
                      {t('document_to_ebook.selected_file')}
                    </h3>
                    <button
                      onClick={clearFile}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      {t('common.clear')}
                    </button>
                  </div>

                  <button
                    onClick={handleConvert}
                    disabled={processing}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 mt-4 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('document_to_ebook.processing')} {progress}%
                      </>
                    ) : (
                      t('document_to_ebook.convert')
                    )}
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
          )}

          {downloadUrl && (
            <div className="text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('document_to_ebook.success_title')}
                </h3>
                <p className="text-gray-600">
                  {t('document_to_ebook.success_desc')}
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
                  {t('document_to_ebook.download')}
                </button>
                <button
                  onClick={handleConvertAnother}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  {t('document_to_ebook.convert_another')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('document_to_ebook.features_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('document_to_ebook.feature1_title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('document_to_ebook.feature1_desc')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('document_to_ebook.feature2_title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('document_to_ebook.feature2_desc')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('document_to_ebook.feature3_title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('document_to_ebook.feature3_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('document_to_ebook.how_to_use_title')}
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">1</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('document_to_ebook.step1')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('document_to_ebook.step1_desc')}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">2</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('document_to_ebook.step2')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('document_to_ebook.step2_desc')}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">3</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('document_to_ebook.step3')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('document_to_ebook.step3_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('document_to_ebook.faq_title')}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">
                {t('document_to_ebook.faq_q1')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('document_to_ebook.faq_a1')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('document_to_ebook.faq_q2')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('document_to_ebook.faq_a2')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('document_to_ebook.faq_q3')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('document_to_ebook.faq_a3')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
