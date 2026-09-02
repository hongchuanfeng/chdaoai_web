'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AiDrawing() {
  const { t } = useLanguage()
  const [prompt, setPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [brushSize, setBrushSize] = useState(20)
  const [brushColor, setBrushColor] = useState('#000000')
  const [isErasing, setIsErasing] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    canvas.style.width = `${canvas.offsetWidth}px`
    canvas.style.height = `${canvas.offsetHeight}px`

    const context = canvas.getContext('2d')
    if (context) {
      context.scale(2, 2)
      context.lineCap = 'round'
      context.strokeStyle = brushColor
      context.lineWidth = brushSize
      contextRef.current = context
    }
  }, [brushSize, brushColor])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !contextRef.current) return

    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    contextRef.current.beginPath()
    contextRef.current.moveTo(clientX - rect.left, clientY - rect.top)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
      e.preventDefault()
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    contextRef.current.lineTo(clientX - rect.left, clientY - rect.top)
    contextRef.current.stroke()
  }

  const finishDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath()
    }
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const context = contextRef.current
    if (!canvas || !context) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    setGeneratedImage(null)
  }

  const handleGenerate = async () => {
    if (!canvasRef.current) return

    if (!user) {
      setError(t('ai_drawing.login_required') || 'Please login first')
      return
    }

    setIsGenerating(true)
    setProcessingProgress(0)
    setError(null)

    try {
      const canvas = canvasRef.current
      const sketchDataUrl = canvas.toDataURL('image/png')

      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 500)

      const response = await fetch('/api/ai-drawing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sketchData: sketchDataUrl,
          prompt: prompt,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to enhance drawing')
      }

      clearInterval(progressInterval)
      setProcessingProgress(100)
      setGeneratedImage(data.resultImage)
      setIsGenerating(false)

    } catch (err: any) {
      console.error('Error enhancing drawing:', err)
      setIsGenerating(false)
      setError(err.message || t('ai_drawing.error_message') || 'An error occurred while processing your drawing.')
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return

    const link = document.createElement('a')
    link.href = generatedImage
    link.download = `ai-drawing-${Date.now()}.png`
    link.click()
  }

  const handleSaveSketch = () => {
    if (!canvasRef.current) return

    const link = document.createElement('a')
    link.href = canvasRef.current.toDataURL('image/png')
    link.download = `sketch-${Date.now()}.png`
    link.click()
  }

  const handleBrushSizeChange = (size: number) => {
    setBrushSize(size)
    if (contextRef.current) {
      contextRef.current.lineWidth = size
    }
  }

  const handleColorChange = (color: string) => {
    setBrushColor(color)
    if (contextRef.current) {
      contextRef.current.strokeStyle = color
    }
  }

  const toggleEraser = () => {
    setIsErasing(!isErasing)
    if (contextRef.current) {
      if (!isErasing) {
        contextRef.current.globalCompositeOperation = 'destination-out'
        contextRef.current.strokeStyle = 'rgba(0,0,0,1)'
      } else {
        contextRef.current.globalCompositeOperation = 'source-over'
        contextRef.current.strokeStyle = brushColor
      }
    }
  }

  const brushColors = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff6600', '#9900ff']

  return (
    <div className="py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('ai_drawing.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('ai_drawing.description')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Drawing Canvas */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('ai_drawing.canvas_title')}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveSketch}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                  >
                    {t('ai_drawing.save_sketch')}
                  </button>
                  <button
                    onClick={clearCanvas}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  >
                    {t('ai_drawing.clear')}
                  </button>
                </div>
              </div>

              {/* Brush Controls */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{t('ai_drawing.brush_size')}:</span>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={brushSize}
                      onChange={(e) => handleBrushSizeChange(Number(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600 w-8">{brushSize}px</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{t('ai_drawing.color')}:</span>
                    <div className="flex gap-1">
                      {brushColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className={`w-6 h-6 rounded-full border-2 ${
                            brushColor === color ? 'border-gray-900' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <input
                        type="color"
                        value={brushColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    onClick={toggleEraser}
                    className={`px-3 py-1 text-sm rounded transition ${
                      isErasing ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {isErasing ? t('ai_drawing.eraser_on') : t('ai_drawing.eraser')}
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={finishDrawing}
                  onMouseLeave={finishDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={finishDrawing}
                  className="w-full h-[400px] cursor-crosshair"
                  style={{ touchAction: 'none' }}
                />
              </div>
            </div>

            {/* Settings & Result */}
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ai_drawing.prompt_label')}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('ai_drawing.prompt_placeholder') || 'Describe how you want to enhance your drawing...'}
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-gray-900"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  isGenerating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('ai_drawing.enhancing')} {Math.round(processingProgress)}%
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {t('ai_drawing.enhance')} (2 {t('ai_drawing.credits')})
                  </>
                )}
              </button>

              {isGenerating && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {generatedImage && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t('ai_drawing.result')}
                  </p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-100">
                    <img
                      src={generatedImage}
                      alt="Enhanced"
                      className="w-full h-auto rounded"
                    />
                  </div>
                  <button
                    onClick={handleDownload}
                    className="mt-4 w-full py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('ai_drawing.download')}
                  </button>
                </div>
              )}

              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <p className="text-sm font-medium text-purple-900">
                      {t('ai_drawing.tip_title')}
                    </p>
                    <p className="text-sm text-purple-700 mt-1">
                      {t('ai_drawing.tip_content')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('ai_drawing.features_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🎨</span>
              <div>
                <h3 className="font-semibold text-gray-900">{t('ai_drawing.feature1')}</h3>
                <p className="text-sm text-gray-600">{t('ai_drawing.feature1_desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">✨</span>
              <div>
                <h3 className="font-semibold text-gray-900">{t('ai_drawing.feature2')}</h3>
                <p className="text-sm text-gray-600">{t('ai_drawing.feature2_desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">📱</span>
              <div>
                <h3 className="font-semibold text-gray-900">{t('ai_drawing.feature3')}</h3>
                <p className="text-sm text-gray-600">{t('ai_drawing.feature3_desc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('ai_drawing.faq_title')}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ai_drawing.faq_q1')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ai_drawing.faq_a1')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ai_drawing.faq_q2')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ai_drawing.faq_a2')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ai_drawing.faq_q3')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ai_drawing.faq_a3')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ai_drawing.faq_q4')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ai_drawing.faq_a4')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ai_drawing.faq_q5')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ai_drawing.faq_a5')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
