'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef, useEffect } from 'react'
import QRCode from 'qrcode'

interface QRCodeGenerateProps {
  toolKey: string
}

export default function QRCodeGenerate({ toolKey }: QRCodeGenerateProps) {
  const { t } = useLanguage()
  const [inputText, setInputText] = useState('')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [batchMode, setBatchMode] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [batchResults, setBatchResults] = useState<{ text: string; dataUrl: string }[]>([])
  const [batchGenerating, setBatchGenerating] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const batchCanvasRef = useRef<HTMLCanvasElement>(null)

  const generateQRCode = async (text: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      QRCode.toCanvas(canvas, text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve(canvas.toDataURL('image/png'))
        }
      })
    })
  }

  useEffect(() => {
    if (generatedImage && canvasRef.current && inputText) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const img = new Image()
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
        }
        img.src = generatedImage
      }
    }
  }, [generatedImage, inputText])

  const handleGenerate = async () => {
    if (!inputText && !batchMode) return
    setGenerating(true)

    try {
      const dataUrl = await generateQRCode(inputText)
      setGeneratedImage(dataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }

    setGenerating(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files)
      setFiles(fileArray)
      setBatchResults([])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
    setBatchResults([])
  }

  const handleBatchGenerate = async () => {
    if (files.length === 0) return

    setBatchGenerating(true)
    setBatchProgress(0)
    setBatchResults([])

    const results: { text: string; dataUrl: string }[] = []
    const allText: string[] = []

    for (const file of files) {
      try {
        const text = await file.text()
        const lines = text.split('\n').filter(line => line.trim())
        allText.push(...lines)
      } catch (error) {
        console.error('Error reading file:', error)
      }
    }

    for (let i = 0; i < allText.length; i++) {
      try {
        const dataUrl = await generateQRCode(allText[i])
        results.push({ text: allText[i], dataUrl })
        setBatchProgress(Math.round(((i + 1) / allText.length) * 100))
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    setBatchResults(results)
    setBatchGenerating(false)
  }

  const clearAll = () => {
    setInputText('')
    setGeneratedImage(null)
    setFiles([])
    setBatchResults([])
    setBatchMode(false)
    setBatchProgress(0)
  }

  const handleDownloadSingle = () => {
    if (!generatedImage) return
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = generatedImage
    link.click()
  }

  const handleDownloadBatch = (dataUrl: string, index: number) => {
    const link = document.createElement('a')
    link.download = `qrcode-${index + 1}.png`
    link.href = dataUrl
    link.click()
  }

  const handleDownloadAllBatch = () => {
    if (batchResults.length === 0) return
    batchResults.forEach((result, index) => {
      setTimeout(() => {
        handleDownloadBatch(result.dataUrl, index)
      }, index * 500)
    })
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
          {/* Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                onClick={() => { setBatchMode(false); setBatchResults([]) }}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  !batchMode
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('qrcode.single')}
              </button>
              <button
                onClick={() => { setBatchMode(true); setGeneratedImage(null) }}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  batchMode
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('qrcode.batch')}
              </button>
            </div>
          </div>

          {!batchMode ? (
            // Single Mode
            <div className="space-y-6">
              <div>
                <label htmlFor="qr-input" className="block text-sm font-medium text-black mb-2">
                  {t('qrcode.enter_content')}
                </label>
                <textarea
                  id="qr-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t('qrcode_generate.input_placeholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black placeholder-gray-400"
                  rows={4}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={!inputText || generating}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400"
              >
                {generating
                  ? t('qrcode_generate.processing')
                  : t('qrcode_generate.generate')
                }
              </button>

              {generatedImage && (
                <div className="mt-6 text-center">
                  <div className="bg-gray-50 p-4 rounded-lg inline-block">
                    <canvas ref={canvasRef} className="max-w-full h-auto" />
                  </div>
                  <div className="mt-4 flex justify-center gap-4">
                    <button
                      onClick={handleDownloadSingle}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {t('qrcode.download')}
                    </button>
                    <button
                      onClick={clearAll}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      {t('common.another') || 'Process Another'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Batch Mode
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="batch-upload"
                  multiple
                />
                <label htmlFor="batch-upload" className="cursor-pointer">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-lg text-gray-700 mb-2">
                    {files.length > 0
                      ? `${files.length} ${t('csv.files_selected')}`
                      : t('qrcode.batch_upload_hint')
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('qrcode.batch_supported')}
                  </p>
                </label>
              </div>

              {files.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-700">
                      {files.length} {t('csv.selected_files')}
                    </h3>
                    <button
                      onClick={() => { setFiles([]); setBatchResults([]) }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      {t('csv.clear_all')}
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded">
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
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
              )}

              <button
                onClick={handleBatchGenerate}
                disabled={files.length === 0 || batchGenerating}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400"
              >
                {batchGenerating
                  ? `${t('qrcode_generate.processing')} ${batchProgress}%`
                  : t('qrcode.batch_generate')
                }
              </button>

              {batchGenerating && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${batchProgress}%` }}
                  ></div>
                </div>
              )}

              {batchResults.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">
                      {batchResults.length} {t('qrcode.generated_qrcodes')}
                    </h3>
                    <button
                      onClick={handleDownloadAllBatch}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {t('qrcode.download_all')}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {batchResults.map((result, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                        <img src={result.dataUrl} alt={`QR ${index + 1}`} className="mx-auto mb-2" />
                        <p className="text-xs text-gray-500 truncate mb-2" title={result.text}>
                          {result.text.length > 20 ? result.text.substring(0, 20) + '...' : result.text}
                        </p>
                        <button
                          onClick={() => handleDownloadBatch(result.dataUrl, index)}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          {t('qrcode.download')}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 text-center">
                    <button
                      onClick={clearAll}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      {t('common.another') || 'Process Another'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
