'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

interface BarcodeRecognizeProps {
  toolKey: string
}

export default function BarcodeRecognize({ toolKey }: BarcodeRecognizeProps) {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [results, setResults] = useState<string[]>([])
  const [recognizing, setRecognizing] = useState(false)
  const [useCamera, setUseCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const recognizeBarcodeFromImage = async (imageSrc: string): Promise<string[]> => {
    const formatsToSupport = [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39,
      Html5QrcodeSupportedFormats.ITF,
      Html5QrcodeSupportedFormats.CODE_93,
      Html5QrcodeSupportedFormats.CODABAR,
      Html5QrcodeSupportedFormats.QR_CODE,
    ]

    const html5QrCode = new Html5Qrcode('barcode-reader', { formatsToSupport, verbose: false })
    html5QrcodeRef.current = html5QrCode

    try {
      const response = await fetch(imageSrc)
      const blob = await response.blob()
      const file = new File([blob], 'image.png', { type: 'image/png' })
      
      const scanResult: string = await html5QrCode.scanFile(file, false)
      const decodedTexts: string[] = []
      
      if (scanResult) {
        decodedTexts.push(scanResult)
      }
      
      return decodedTexts
    } catch (err) {
      console.error('Error scanning barcode:', err)
      throw err
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setError(null)

      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
      setResult(null)
      setResults([])
    }
  }

  const handleRecognize = async () => {
    if (!preview) return
    setRecognizing(true)
    setError(null)
    setResult(null)
    setResults([])

    try {
      const decodedTexts = await recognizeBarcodeFromImage(preview)
      if (decodedTexts.length > 0) {
        setResults(decodedTexts)
        setResult(decodedTexts[0])
      } else {
        setError(t('barcode_recognize.no_barcode') || 'No barcode found in the image')
      }
    } catch (err) {
      console.error('Error recognizing barcode:', err)
      setError(t('barcode_recognize.recognition_error') || 'Failed to recognize barcode')
    }

    setRecognizing(false)
  }

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      setCameraStream(stream)
      setUseCamera(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError(t('barcode_recognize.camera_error') || 'Failed to access camera')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (html5QrcodeRef.current && scanning) {
      html5QrcodeRef.current.stop().catch(() => {})
      setScanning(false)
    }
    setCameraStream(null)
    setUseCamera(false)
  }

  const startScanning = async () => {
    if (!videoRef.current) return

    try {
      const html5QrCode = new Html5Qrcode('barcode-scanner-video')
      html5QrcodeRef.current = html5QrCode
      setScanning(true)

      const configs = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.5,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.QR_CODE,
        ]
      }

      await html5QrCode.start(
        { facingMode: 'environment' },
        configs,
        (decodedText) => {
          if (decodedText && !results.includes(decodedText)) {
            setResults(prev => [...prev, decodedText])
            setResult(decodedText)
          }
        },
        () => {}
      )
    } catch (err) {
      console.error('Error starting scanner:', err)
      setError(t('barcode_recognize.scanner_error') || 'Failed to start scanner')
      setScanning(false)
    }
  }

  const stopScanning = async () => {
    if (html5QrcodeRef.current && scanning) {
      try {
        await html5QrcodeRef.current.stop()
        setScanning(false)
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
    }
  }

  const handleCameraCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageSrc = canvas.toDataURL('image/png')
        stopCamera()
        setPreview(imageSrc)
        setRecognizing(true)
        setError(null)

        recognizeBarcodeFromImage(imageSrc)
          .then((decodedTexts) => {
            if (decodedTexts.length > 0) {
              setResults(decodedTexts)
              setResult(decodedTexts[0])
            } else {
              setError(t('barcode_recognize.no_barcode') || 'No barcode found')
            }
          })
          .catch(() => {
            setError(t('barcode_recognize.recognition_error') || 'Failed to recognize barcode')
          })
          .finally(() => {
            setRecognizing(false)
          })
      }
    }
  }

  const clearAll = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setResults([])
    setError(null)
    stopCamera()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
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
          {/* Hidden div required by Html5Qrcode library */}
          <div id="barcode-reader" className="hidden"></div>
          
          {/* Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                onClick={() => { setUseCamera(false); stopCamera(); setError(null) }}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  !useCamera
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('barcode.upload_image')}
              </button>
              <button
                onClick={() => { if (!useCamera) startCamera() }}
                disabled={recognizing}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  useCamera
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {t('barcode.use_camera')}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!useCamera ? (
            // Upload Image Mode
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="barcode-upload"
                />
                <label htmlFor="barcode-upload" className="cursor-pointer">
                  <div className="text-6xl mb-4">📷</div>
                  <p className="text-lg text-black mb-2">
                    {preview
                      ? t('barcode.image_selected')
                      : t(`${toolKey.replace(/-/g, '_')}.upload`)
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    {t(`${toolKey.replace(/-/g, '_')}.supported`)}
                  </p>
                </label>
              </div>

              {preview && (
                <div className="mt-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full mx-auto rounded-lg shadow-md"
                  />
                </div>
              )}

              {(result || results.length > 0) && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 font-semibold mb-2">
                    {t('barcode.recognized_result')}:
                  </p>
                  <div className="space-y-2">
                    {results.map((res, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <p className="text-gray-800 break-all">{res}</p>
                        <button
                          onClick={() => copyToClipboard(res)}
                          className="ml-2 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {t('qrcode.copy_result')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleRecognize}
                disabled={!preview || recognizing}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400"
              >
                {recognizing
                  ? t(`${toolKey.replace(/-/g, '_')}.processing`)
                  : t(`${toolKey.replace(/-/g, '_')}.recognize`)
                }
              </button>

              {(preview || result) && (
                <button
                  onClick={clearAll}
                  className="w-full text-gray-600 py-2 hover:text-gray-800"
                >
                  {t('csv.clear_all')}
                </button>
              )}
            </div>
          ) : (
            // Camera Mode
            <div className="space-y-6">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto"
                  id="barcode-scanner-video"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCameraCapture}
                  disabled={recognizing}
                  className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400"
                >
                  {recognizing
                    ? t(`${toolKey.replace(/-/g, '_')}.processing`)
                    : t('barcode.capture')
                  }
                </button>
                <button
                  onClick={() => { stopCamera(); setPreview(null); setResult(null); setResults([]) }}
                  disabled={recognizing}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition disabled:bg-gray-300"
                >
                  {t('barcode.stop_camera')}
                </button>
              </div>

              <button
                onClick={scanning ? stopScanning : startScanning}
                disabled={recognizing}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {scanning
                  ? t('barcode.stop_scanning') || 'Stop Scanning'
                  : t('barcode.start_scanning') || 'Start Scanning'
                }
              </button>

              {(result || results.length > 0) && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 font-semibold mb-2">
                    {t('barcode.recognized_result')}:
                  </p>
                  <div className="space-y-2">
                    {results.map((res, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <p className="text-gray-800 break-all">{res}</p>
                        <button
                          onClick={() => copyToClipboard(res)}
                          className="ml-2 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {t('qrcode.copy_result')}
                        </button>
                      </div>
                    ))}
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
