'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef, useEffect } from 'react'

export default function TextToImage() {
  const { t } = useLanguage()
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState(48)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [textColor, setTextColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [bgTransparent, setBgTransparent] = useState(false)
  const [padding, setPadding] = useState(20)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const fontOptions = [
    'Arial',
    'Verdana',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS',
  ]

  const presetColors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#88ff00',
  ]

  useEffect(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const generateImage = () => {
    const canvas = canvasRef.current
    if (!canvas || !text.trim()) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.font = `${fontSize}px "${fontFamily}"`
    const metrics = ctx.measureText(text)
    const textWidth = metrics.width
    const textHeight = fontSize

    const canvasWidth = textWidth + padding * 2
    const canvasHeight = textHeight + padding * 2

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    if (bgTransparent) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    } else {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    }

    ctx.fillStyle = textColor
    ctx.font = `${fontSize}px "${fontFamily}"`
    ctx.textBaseline = 'top'
    ctx.fillText(text, padding, padding)

    const dataUrl = canvas.toDataURL('image/png')
    setPreviewUrl(dataUrl)
  }

  const handleDownload = () => {
    if (!previewUrl) return
    const link = document.createElement('a')
    link.href = previewUrl
    link.download = `text-image-${Date.now()}.png`
    link.click()
  }

  const handleClear = () => {
    setText('')
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleCopyToClipboard = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const blob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob(resolve, 'image/png')
      )
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
        alert(t('text_to_image.copied') || 'Copied to clipboard!')
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('text_to_image.title') || 'Text to Image'}
          </h1>
          <p className="text-xl text-gray-600">
            {t('text_to_image.description') || 'Convert your text into beautiful images'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('text_to_image.enter_text') || 'Enter Text'}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('text_to_image.text_placeholder') || 'Type your text here...'}
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder:text-gray-400 text-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('text_to_image.font_size') || 'Font Size'}: {fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="120"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('text_to_image.font_family') || 'Font Family'}
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {fontOptions.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('text_to_image.text_color') || 'Text Color'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                />
                <span className="text-sm text-gray-500">{textColor}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setTextColor(color)}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('text_to_image.background') || 'Background'}
              </label>
              <div className="flex items-center gap-4 mb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={bgTransparent}
                    onChange={(e) => setBgTransparent(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{t('text_to_image.transparent') || 'Transparent'}</span>
                </label>
              </div>
              {!bgTransparent && (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                  />
                  <span className="text-sm text-gray-500">{bgColor}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('text_to_image.padding') || 'Padding'}: {padding}px
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={generateImage}
              disabled={!text.trim()}
              className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                !text.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t('text_to_image.generate') || 'Generate Image'}
            </button>

            <button
              onClick={handleClear}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              {t('text_to_image.clear') || 'Clear'}
            </button>
          </div>

          {previewUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('text_to_image.preview') || 'Preview'}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto mx-auto"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <button
                  onClick={handleDownload}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('text_to_image.download') || 'Download'}
                </button>
                <button
                  onClick={handleCopyToClipboard}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {t('text_to_image.copy') || 'Copy to Clipboard'}
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('text_to_image.features_title') || 'Features'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🎨</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('text_to_image.feature1') || 'Customizable Fonts'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('text_to_image.feature1_desc') || 'Choose from multiple font families and sizes'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🌈</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('text_to_image.feature2') || 'Color Options'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('text_to_image.feature2_desc') || 'Custom text and background colors'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">📋</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('text_to_image.feature3') || 'Copy to Clipboard'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('text_to_image.feature3_desc') || 'Easily copy generated images'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">⬇️</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('text_to_image.feature4') || 'Download PNG'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('text_to_image.feature4_desc') || 'Export high-quality PNG images'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
