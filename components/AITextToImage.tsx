'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AITextToImage() {
  const { t } = useLanguage()
  const [prompt, setPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()

  const examplePrompts = [
    t('ai_text_to_image.example1') || 'A beautiful sunset over the ocean',
    t('ai_text_to_image.example2') || 'A futuristic city with flying cars',
    t('ai_text_to_image.example3') || 'A cute cat wearing sunglasses',
  ]

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    if (!user) {
      setError(t('ai_text_to_image.login_required') || 'Please login first')
      return
    }

    setIsGenerating(true)
    setProcessingProgress(0)
    setError(null)
    setGeneratedImage(null)

    try {
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 500)

      const response = await fetch('/api/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to generate image')
      }
      
      clearInterval(progressInterval)
      setProcessingProgress(100)
      setGeneratedImage(data.resultImage)
      setIsGenerating(false)

    } catch (err: any) {
      console.error('Error generating image:', err)
      setIsGenerating(false)
      setError(err.message || t('ai_text_to_image.error_message') || 'An error occurred while generating the image.')
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return

    const link = document.createElement('a')
    link.href = generatedImage
    link.download = `ai-generated-${Date.now()}.png`
    link.click()
  }

  const handleGenerateAnother = () => {
    setGeneratedImage(null)
    setPrompt('')
    setProcessingProgress(0)
    setError(null)
  }

  const handleExampleClick = (example: string) => {
    setPrompt(example)
  }

  const characterCount = prompt.length
  const maxCharacters = 500

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('ai_text_to_image.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('ai_text_to_image.description')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {!generatedImage ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ai_text_to_image.prompt_label')}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('ai_text_to_image.prompt_placeholder') || 'Describe the image you want to generate...'}
                  className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none placeholder:text-gray-900 text-gray-900"
                  maxLength={maxCharacters}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {t('ai_text_to_image.prompt_tip')}
                  </span>
                  <span className={`text-xs ${characterCount > maxCharacters * 0.9 ? 'text-orange-500' : 'text-gray-500'}`}>
                    {characterCount}/{maxCharacters}
                  </span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {t('ai_text_to_image.examples_title')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
                      disabled={isGenerating}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  !prompt.trim() || isGenerating
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
                    {t('ai_text_to_image.generating')} {Math.round(processingProgress)}%
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {t('ai_text_to_image.generate')}
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

              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <p className="text-sm font-medium text-purple-900">
                      {t('ai_text_to_image.tip_title')}
                    </p>
                    <p className="text-sm text-purple-700 mt-1">
                      {t('ai_text_to_image.tip_content')}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div>
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {t('ai_text_to_image.your_prompt')}
                </p>
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  {prompt}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {t('ai_text_to_image.generated_image')}
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-100">
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full h-auto rounded"
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={handleDownload}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('ai_text_to_image.download')}
                </button>
                <button
                  onClick={handleGenerateAnother}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  {t('ai_text_to_image.generate_another')}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('ai_text_to_image.features_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('ai_text_to_image.feature1')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('ai_text_to_image.feature1_desc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('ai_text_to_image.feature2')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('ai_text_to_image.feature2_desc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🎨</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('ai_text_to_image.feature3')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('ai_text_to_image.feature3_desc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">📱</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('ai_text_to_image.feature4')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('ai_text_to_image.feature4_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('ai_text_to_image.faq_title')}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ai_text_to_image.faq_q1')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ai_text_to_image.faq_a1')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ai_text_to_image.faq_q2')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ai_text_to_image.faq_a2')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ai_text_to_image.faq_q3')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ai_text_to_image.faq_a3')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('ai_text_to_image.faq_q4')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('ai_text_to_image.faq_a4')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
