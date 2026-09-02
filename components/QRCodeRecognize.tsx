'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef, useEffect } from 'react'
import jsQR from 'jsqr'

interface QRCodeRecognizeProps {
  toolKey: string
}

export default function QRCodeRecognize({ toolKey }: QRCodeRecognizeProps) {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [recognizing, setRecognizing] = useState(false)
  const [useCamera, setUseCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const recognizeQRCode = async (imageData: ImageData): Promise<string | null> => {
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    return code ? code.data : null
  }

  const processImage = async (imgSource: HTMLImageElement | HTMLVideoElement): Promise<string | null> => {
    const canvas = document.createElement('canvas')
    canvas.width = imgSource.width
    canvas.height = imgSource.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(imgSource, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    return await recognizeQRCode(imageData)
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
    }
  }

  const handleRecognize = async () => {
    if (!preview) return
    setRecognizing(true)
    setError(null)
    setResult(null)

    try {
      const img = new Image()
      img.onload = async () => {
        const recognizedResult = await processImage(img)
        if (recognizedResult) {
          setResult(recognizedResult)
        } else {
          setError(t('qrcode_recognize.no_qrcode') || 'No QR code found in the image')
        }
        setRecognizing(false)
      }
      img.onerror = () => {
        setError(t('qrcode_recognize.load_error') || 'Failed to load image')
        setRecognizing(false)
      }
      img.src = preview
    } catch (err) {
      console.error('Error recognizing QR code:', err)
      setError(t('qrcode_recognize.recognition_error') || 'Failed to recognize QR code')
      setRecognizing(false)
    }
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
      setError(t('qrcode_recognize.camera_error') || 'Failed to access camera')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraStream(null)
    setUseCamera(false)
  }

  const handleCameraCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        setRecognizing(true)
        setError(null)

        const recognizedResult = await recognizeQRCode(imageData)
        if (recognizedResult) {
          setResult(recognizedResult)
          setPreview(canvas.toDataURL('image/png'))
          stopCamera()
        } else {
          setError(t('qrcode_recognize.no_qrcode') || 'No QR code found')
        }
        setRecognizing(false)
      }
    }
  }

  const clearAll = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    stopCamera()
  }

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result)
    }
  }

  const isUrl = (text: string): boolean => {
    try {
      new URL(text)
      return true
    } catch {
      return false
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
                {t('qrcode.upload_image')}
              </button>
              <button
                onClick={startCamera}
                disabled={recognizing}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  useCamera
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {t('qrcode.use_camera')}
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
                  id="qrcode-upload"
                />
                <label htmlFor="qrcode-upload" className="cursor-pointer">
                  <div className="text-6xl mb-4">📷</div>
                  <p className="text-lg text-black mb-2">
                    {preview
                      ? t('qrcode.image_selected')
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

              {result && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 font-semibold mb-2">
                    {t('qrcode.recognized_result')}:
                  </p>
                  {isUrl(result) ? (
                    <a
                      href={result}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {result}
                    </a>
                  ) : (
                    <p className="text-gray-800 break-all">{result}</p>
                  )}
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={copyToClipboard}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {t('qrcode.copy_result')}
                    </button>
                    {isUrl(result) && (
                      <a
                        href={result}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {t('qrcode.open_link') || 'Open Link'}
                      </a>
                    )}
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
                    : t('qrcode.capture')
                  }
                </button>
                <button
                  onClick={stopCamera}
                  disabled={recognizing}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition disabled:bg-gray-300"
                >
                  {t('qrcode.stop_camera')}
                </button>
              </div>

              {result && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 font-semibold mb-2">
                    {t('qrcode.recognized_result')}:
                  </p>
                  {isUrl(result) ? (
                    <a
                      href={result}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {result}
                    </a>
                  ) : (
                    <p className="text-gray-800 break-all">{result}</p>
                  )}
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={copyToClipboard}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {t('qrcode.copy_result')}
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
