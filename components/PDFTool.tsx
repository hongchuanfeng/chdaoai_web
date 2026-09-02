'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

interface PDFToolProps {
  toolKey: string
}

export default function PDFTool({ toolKey }: PDFToolProps) {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioFileName, setAudioFileName] = useState('')
  const [pdfText, setPdfText] = useState<string>('')
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
      setError(t('pdf_to_audio.invalid_file') || 'Please select a PDF file')
      return
    }
    
    setFile(selectedFile)
    setError('')
    setAudioUrl(null)
    setProgress(0)
    setPdfText('')
  }

  const handleClear = () => {
    setFile(null)
    setAudioUrl(null)
    setError('')
    setProgress(0)
    setPdfText('')
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const extractTextFromPDF = async (pdfDoc: any): Promise<string> => {
    let fullText = ''
    const numPages = pdfDoc.numPages
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      fullText += pageText + '\n\n'
      setProgress(Math.floor((i / numPages) * 30))
    }
    
    return fullText.trim()
  }

  const loadPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib)
        return
      }
      
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = () => resolve((window as any).pdfjsLib)
      script.onerror = () => reject(new Error('Failed to load PDF.js'))
      document.head.appendChild(script)
    })
  }

  const convertToAudio = async () => {
    if (!file) return
    
    setProcessing(true)
    setError('')
    setProgress(0)
    
    try {
      const pdfjsLib = await loadPdfJs()
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      
      const arrayBuffer = await file.arrayBuffer()
      setProgress(10)
      
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setProgress(20)
      
      const text = await extractTextFromPDF(pdfDoc)
      
      if (!text) {
        throw new Error(t('pdf_to_audio.no_text') || 'No text found in PDF')
      }
      
      setPdfText(text)
      setProgress(50)
      
      // Create Google TTS URL (text limited to ~300 chars per request)
      const cleanText = text.replace(/\s+/g, ' ').trim()
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText.slice(0, 200))}&tl=en&client=tw-ob`
      
      setAudioUrl(ttsUrl)
      setAudioFileName(file.name.replace('.pdf', '.mp3'))
      setProgress(100)
      
    } catch (err) {
      console.error('Conversion error:', err)
      setError(err instanceof Error ? err.message : (t('pdf_to_audio.error') || 'Conversion failed'))
    } finally {
      setProcessing(false)
    }
  }

  const downloadAudio = () => {
    if (!audioUrl) return
    
    // Open in new tab for download
    const win = window.open(audioUrl, '_blank')
    if (win) {
      win.focus()
    }
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
          {!audioUrl ? (
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

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-center">{error}</p>
                </div>
              )}

              {file && (
                <div className="mt-6 space-y-4">
                  {processing && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                  
                  <button
                    onClick={convertToAudio}
                    disabled={processing}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400"
                  >
                    {processing ? t(`${toolKey.replace(/-/g, '_')}.processing`) : t(`${toolKey.replace(/-/g, '_')}.convert`)}
                  </button>
                  
                  <button
                    onClick={handleClear}
                    disabled={processing}
                    className="w-full bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-semibold hover:bg-gray-300 transition disabled:bg-gray-100"
                  >
                    {t('common.clear')}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-xl text-gray-700 mb-4">
                  {t('pdf_to_audio.success') || 'Conversion completed!'}
                </p>
              </div>
              
              <audio controls className="w-full mb-6" src={audioUrl} autoPlay>
                Your browser does not support the audio element.
              </audio>
              
              <p className="text-sm text-gray-500 mb-4">
                {t('pdf_to_audio.listen') || 'Listen to the audio. Right-click the download button and select "Save link as..." to download.'}
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={downloadAudio}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  {t('common.download')}
                </button>
                
                <button
                  onClick={handleClear}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  {t('common.another')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
