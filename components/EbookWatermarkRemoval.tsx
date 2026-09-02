'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

export default function EbookWatermarkRemoval() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [watermarkText, setWatermarkText] = useState('')
  const [watermarkOption, setWatermarkOption] = useState<'remove' | 'replace' | 'cover'>('remove')
  const [replacementText, setReplacementText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setError('')
      setDownloadUrl('')
      // Extract filename as potential watermark text hint
      setWatermarkText(selectedFile.name.replace(/\.[^/.]+$/, ''))
    }
  }

  const clearFile = () => {
    setFile(null)
    setDownloadUrl('')
    setError('')
    setProgress(0)
    setWatermarkText('')
    setReplacementText('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeWatermarkFromText = (content: string, watermark: string, replacement: string): string => {
    if (!watermark.trim()) return content
    
    // Remove exact match
    let result = content.split(watermark).join(replacement)
    
    // Remove with variations (add spaces around)
    result = result.split(` ${watermark} `).join(` ${replacement} `)
    result = result.split(` ${watermark}.`).join(` ${replacement}.`)
    result = result.split(`${watermark} `).join(`${replacement} `)
    
    // Remove common watermark patterns
    const patterns = [
      new RegExp(`©\\s*${watermark}`, 'gi'),
      new RegExp(`Copyright\\s*©?\\s*${watermark}`, 'gi'),
      new RegExp(`${watermark}\\s*©`, 'gi'),
      new RegExp(`${watermark}\\s*All\\s*rights`, 'gi'),
      new RegExp(`${watermark}\\s*\\|\\s*.*`, 'gi'),
      new RegExp(`${watermark}\\s*-\\s*.*`, 'gi'),
    ]
    
    patterns.forEach(pattern => {
      result = result.replace(pattern, replacement)
    })
    
    return result
  }

  const handleRemoveWatermark = async () => {
    if (!file) return
    setProcessing(true)
    setError('')
    setProgress(0)

    try {
      const JSZip = (await import('jszip')).default
      const ext = file.name.toLowerCase().split('.').pop()
      
      setProgress(10)
      
      if (ext === 'epub') {
        // Handle ePub (which is a ZIP file)
        const arrayBuffer = await file.arrayBuffer()
        const zip = await JSZip.loadAsync(arrayBuffer)
        
        setProgress(30)
        
        const files = zip.files
        const xhtmlFiles = Object.keys(files).filter(name => 
          name.endsWith('.xhtml') || name.endsWith('.html') || name.endsWith('.htm')
        )
        
        let modified = false
        
        for (const fileName of xhtmlFiles) {
          const content = await zip.file(fileName)?.async('string')
          if (content) {
            let newContent = content
            
            // Remove watermark text if specified
            if (watermarkText.trim()) {
              newContent = removeWatermarkFromText(newContent, watermarkText, replacementText)
            }
            
            // Remove common watermark patterns
            const watermarkPatterns = [
              /<div[^>]*class="[^"]*watermark[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
              /<span[^>]*class="[^"]*watermark[^"]*"[^>]*>[\s\S]*?<\/span>/gi,
              /<p[^>]*class="[^"]*watermark[^"]*"[^>]*>[\s\S]*?<\/p>/gi,
              /<!--\s*watermark[\s\S]*?-->/gi,
              /<div[^>]*style="[^"]*opacity[^"]*fixed[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
              /<img[^>]*watermark[^>]*>/gi,
              /<svg[^>]*watermark[^>]*>[\s\S]*?<\/svg>/gi,
            ]
            
            watermarkPatterns.forEach(pattern => {
              newContent = newContent.replace(pattern, '')
            })
            
            // Remove position:fixed elements (often used for watermarks)
            newContent = newContent.replace(/style="[^"]*position:\s*fixed[^"]*"/gi, 'style="display: none"')
            newContent = newContent.replace(/style="[^"]*position:\s*absolute[^"]*top:\s*0[^"]*"/gi, 'style="display: none"')
            
            if (newContent !== content) {
              zip.file(fileName, newContent)
              modified = true
            }
          }
        }
        
        setProgress(60)
        
        // Also clean up ncx and content.opf
        const contentOpf = await zip.file('OEBPS/content.opf')?.async('string')
        if (contentOpf && watermarkText.trim()) {
          const newOpf = removeWatermarkFromText(contentOpf, watermarkText, replacementText)
          if (newOpf !== contentOpf) {
            zip.file('OEBPS/content.opf', newOpf)
            modified = true
          }
        }
        
        setProgress(80)
        
        if (!modified) {
          throw new Error(t('ebook_watermark_removal.no_watermark_found'))
        }
        
        // Generate new ePub
        const newBlob = await zip.generateAsync({
          type: 'blob',
          mimeType: 'application/epub+zip',
          compression: 'DEFLATE'
        })
        
        setProgress(100)
        const url = URL.createObjectURL(newBlob)
        setDownloadUrl(url)
        
      } else if (ext === 'pdf') {
        // Handle PDF
        const { PDFDocument } = await import('pdf-lib')
        
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        
        setProgress(30)
        
        // Remove metadata watermarks
        const title = pdfDoc.getTitle()
        if (title && watermarkText.trim() && title.includes(watermarkText)) {
          pdfDoc.setTitle(title.replace(watermarkText, replacementText || ' '))
        }
        
        const author = pdfDoc.getAuthor()
        if (author && watermarkText.trim() && author.includes(watermarkText)) {
          pdfDoc.setAuthor(author.replace(watermarkText, replacementText || ' '))
        }
        
        const creator = pdfDoc.getCreator()
        if (creator && watermarkText.trim() && creator.includes(watermarkText)) {
          pdfDoc.setCreator(creator.replace(watermarkText, replacementText || ' '))
        }
        
        const producer = pdfDoc.getProducer()
        if (producer && watermarkText.trim() && producer.includes(watermarkText)) {
          pdfDoc.setProducer(producer.replace(watermarkText, replacementText || ' '))
        }
        
        setProgress(70)
        
        // Try to remove text watermarks from pages (basic implementation)
        // Note: Complex watermark removal from PDF requires more advanced processing
        const pages = pdfDoc.getPages()
        for (const page of pages) {
          // This is a placeholder - actual watermark removal from PDF content streams
          // would require more sophisticated parsing
        }
        
        setProgress(90)
        
        // Save modified PDF
        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)
        
        setProgress(100)
      } else {
        throw new Error(t('ebook_watermark_removal.unsupported_format'))
      }
      
    } catch (err: any) {
      console.error('Watermark removal error:', err)
      setError(err.message || t('ebook_watermark_removal.failed'))
    }

    setProcessing(false)
  }

  const handleDownload = () => {
    if (!downloadUrl) return
    const link = document.createElement('a')
    link.href = downloadUrl
    const ext = file?.name.split('.').pop() || 'epub'
    link.download = file?.name.replace(/\.[^/.]+$/, '') + '_clean.' + ext
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
            {t('nav.ebook_watermark_removal')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('ebook_watermark_removal.description')}
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
                  accept=".epub,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="ebook-upload"
                />
                <div className="cursor-pointer">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-lg text-gray-700 mb-2">
                    {file 
                      ? file.name 
                      : t('ebook_watermark_removal.upload')
                    }
                  </p>
                  {file && (
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {t('ebook_watermark_removal.supported')}
                  </p>
                </div>
              </div>

              {file && (
                <div className="mt-6 space-y-4">
                  {/* Watermark Options */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">
                      {t('ebook_watermark_removal.watermark_options')}
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          {t('ebook_watermark_removal.watermark_text')}
                        </label>
                        <input
                          type="text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          placeholder={t('ebook_watermark_removal.watermark_text_placeholder')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          {t('ebook_watermark_removal.action')}
                        </label>
                        <select
                          value={watermarkOption}
                          onChange={(e) => setWatermarkOption(e.target.value as any)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                        >
                          <option value="remove">{t('ebook_watermark_removal.remove')}</option>
                          <option value="replace">{t('ebook_watermark_removal.replace')}</option>
                          <option value="cover">{t('ebook_watermark_removal.cover')}</option>
                        </select>
                      </div>
                      
                      {watermarkOption === 'replace' && (
                        <div>
                          <label className="block text-sm font-medium text-black mb-1">
                            {t('ebook_watermark_removal.replacement_text')}
                          </label>
                          <input
                            type="text"
                            value={replacementText}
                            onChange={(e) => setReplacementText(e.target.value)}
                            placeholder={t('ebook_watermark_removal.replacement_placeholder')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleRemoveWatermark}
                    disabled={processing}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('ebook_watermark_removal.processing')} {progress}%
                      </>
                    ) : (
                      t('ebook_watermark_removal.remove_watermark')
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
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('ebook_watermark_removal.success_title')}
                </h3>
                <p className="text-gray-600">
                  {t('ebook_watermark_removal.success_desc')}
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
                  {t('ebook_watermark_removal.download')}
                </button>
                <button
                  onClick={handleConvertAnother}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  {t('ebook_watermark_removal.process_another')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('ebook_watermark_removal.features_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('ebook_watermark_removal.feature1_title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('ebook_watermark_removal.feature1_desc')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('ebook_watermark_removal.feature2_title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('ebook_watermark_removal.feature2_desc')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('ebook_watermark_removal.feature3_title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('ebook_watermark_removal.feature3_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('ebook_watermark_removal.how_it_works_title')}
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">1</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('ebook_watermark_removal.step1')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('ebook_watermark_removal.step1_desc')}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">2</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('ebook_watermark_removal.step2')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('ebook_watermark_removal.step2_desc')}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">3</div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {t('ebook_watermark_removal.step3')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('ebook_watermark_removal.step3_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('ebook_watermark_removal.faq_title')}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ebook_watermark_removal.faq_q1')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ebook_watermark_removal.faq_a1')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ebook_watermark_removal.faq_q2')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ebook_watermark_removal.faq_a2')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ebook_watermark_removal.faq_q3')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ebook_watermark_removal.faq_a3')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
