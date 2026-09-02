'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

interface PDFTranslateToolProps {
  toolKey: string
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' },
]

export default function PDFTranslateTool({ toolKey }: PDFTranslateToolProps) {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [originalText, setOriginalText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLang, setSourceLang] = useState('en')
  const [targetLang, setTargetLang] = useState('zh')
  const [downloadUrl, setDownloadUrl] = useState('')
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
      setError(t('pdf_translate.invalid_file') || 'Please select a PDF file')
      return
    }
    
    setFile(selectedFile)
    setError('')
    setOriginalText('')
    setTranslatedText('')
    setDownloadUrl('')
    setProgress(0)
  }

  const clearFile = () => {
    setFile(null)
    setOriginalText('')
    setTranslatedText('')
    setDownloadUrl('')
    setError('')
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Extract text from PDF
  const extractTextFromPDF = async (file: File): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    let fullText = ''
    const numPages = pdf.numPages
    
    for (let i = 1; i <= numPages; i++) {
      setProgress(Math.floor(5 + (i / numPages) * 25))
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map((item: any) => item.str).join(' ')
      fullText += pageText + '\n\n'
    }
    
    return fullText.trim()
  }

  // Translate text using LibreTranslate API (free and open source)
  const translateText = async (text: string, from: string, to: string): Promise<string> => {
    try {
      // Try LibreTranslate API
      const response = await fetch('https://libretranslate.com/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: from,
          target: to,
          format: 'text'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.translatedText
      }
      throw new Error('LibreTranslate failed')
    } catch {
      // Fallback: Use Google Translate (scraping approach)
      try {
        const encodedText = encodeURIComponent(text)
        const response = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodedText}`
        )
        const data = await response.json()
        if (data && data[0]) {
          return data[0].map((item: any) => item[0]).join('')
        }
      } catch (e) {
        console.error('Translation error:', e)
      }
      throw new Error(t('pdf_translate.translation_failed') || 'Translation service unavailable')
    }
  }

  const handleTranslate = async () => {
    if (!file) return
    
    setProcessing(true)
    setError('')
    setProgress(0)
    setOriginalText('')
    setTranslatedText('')
    setDownloadUrl('')

    try {
      // Extract text from PDF
      setProgress(5)
      const text = await extractTextFromPDF(file)
      
      if (!text || text.trim().length === 0) {
        setError(t('pdf_translate.no_text') || 'No text content found in PDF')
        setProcessing(false)
        return
      }
      
      setOriginalText(text)
      setProgress(35)
      
      // Translate text
      const translated = await translateText(text, sourceLang, targetLang)
      setTranslatedText(translated)
      setProgress(80)
      
      // Create download file
      const blob = new Blob([translated], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      
      setProgress(100)
      setProcessing(false)
      
    } catch (err: any) {
      console.error('Translation error:', err)
      setError(err.message || t('pdf_translate.failed') || 'Translation failed')
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!downloadUrl || !file) return
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = file.name.replace('.pdf', `_translated_${targetLang}.txt`)
    link.click()
  }

  const handleDownloadOriginal = () => {
    if (!originalText || !file) return
    const blob = new Blob([originalText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name.replace('.pdf', '_original.txt')
    link.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const handleConvertAnother = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl)
    }
    setDownloadUrl('')
    setOriginalText('')
    setTranslatedText('')
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
          {!originalText ? (
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
                    {file 
                      ? file.name 
                      : t(`${toolKey.replace(/-/g, '_')}.upload`)
                    }
                  </p>
                  {file && (
                    <p className="text-sm text-gray-500">
                      ({formatFileSize(file.size)})
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {t(`${toolKey.replace(/-/g, '_')}.supported`)}
                  </p>
                </div>
              </label>

              {file && (
                <div className="mt-6 space-y-4">
                  {/* Language Selection */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">
                      {t('pdf_translate.language_selection') || 'Language Selection'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('pdf_translate.source_language') || 'Source Language'}
                        </label>
                        <select
                          value={sourceLang}
                          onChange={(e) => setSourceLang(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                        >
                          {LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('pdf_translate.target_language') || 'Target Language'}
                        </label>
                        <select
                          value={targetLang}
                          onChange={(e) => setTargetLang(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                        >
                          {LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleTranslate}
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
                      t(`${toolKey.replace(/-/g, '_')}.translate`)
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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">
                  {t('pdf_translate.result') || 'Translation Result'}
                </h3>
                <button
                  onClick={handleConvertAnother}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {t('pdf_translate.translate_another') || 'Translate Another'}
                </button>
              </div>
              
              {/* Original Text */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700">
                    {t('pdf_translate.original') || 'Original Text'} ({LANGUAGES.find(l => l.code === sourceLang)?.name})
                  </h4>
                  <button
                    onClick={() => copyToClipboard(originalText)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {t('pdf_translate.copy') || 'Copy'}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {originalText}
                  </p>
                </div>
                <button
                  onClick={handleDownloadOriginal}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  {t('pdf_translate.download_original') || 'Download Original'}
                </button>
              </div>
              
              {/* Translated Text */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700">
                    {t('pdf_translate.translated') || 'Translated Text'} ({LANGUAGES.find(l => l.code === targetLang)?.name})
                  </h4>
                  <button
                    onClick={() => copyToClipboard(translatedText)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {t('pdf_translate.copy') || 'Copy'}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {translatedText}
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex justify-between text-sm text-gray-500">
                <span>{t('pdf_translate.characters') || 'Characters'}: {translatedText.length.toLocaleString()}</span>
                <span>{t('pdf_translate.words') || 'Words'}: {translatedText.split(/\s+/).filter(Boolean).length.toLocaleString()}</span>
              </div>
              
              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={!downloadUrl}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t('pdf_translate.download') || 'Download Translation'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
