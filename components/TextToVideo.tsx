'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function TextToVideo() {
  const { t } = useLanguage()
  const [prompt, setPrompt] = useState('')
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const supabase = createClientComponentClient()

  const examplePrompts = [
    t('text_to_video.example1') || 'A beautiful sunset over the ocean waves',
    t('text_to_video.example2') || 'City traffic at night with light trails',
    t('text_to_video.example3') || 'Flowers blooming in slow motion',
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
      setError(t('text_to_video.login_required') || 'Please login first')
      return
    }

    setIsGenerating(true)
    setProcessingProgress(0)
    setError(null)
    setGeneratedVideo(null)
    setVideoLoaded(false)

    try {
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 8
        })
      }, 500)

      const response = await fetch('/api/text-to-video', {
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
        throw new Error(data.error || data.details || 'Failed to generate video')
      }
      
      clearInterval(progressInterval)
      setProcessingProgress(100)
      setGeneratedVideo(data.videoUrl)
      setIsGenerating(false)

    } catch (err: any) {
      console.error('Error generating video:', err)
      setIsGenerating(false)
      setError(err.message || t('text_to_video.error_message') || 'An error occurred while generating the video.')
    }
  }

  const handleDownload = () => {
    if (!generatedVideo) return

    const link = document.createElement('a')
    link.href = generatedVideo
    link.target = '_blank'
    link.download = `ai-generated-${Date.now()}.mp4`
    link.click()
  }

  const handleGenerateAnother = () => {
    setGeneratedVideo(null)
    setPrompt('')
    setProcessingProgress(0)
    setError(null)
    setVideoLoaded(false)
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
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span>⚡</span>
            <span>{t('text_to_video.credits_info') || '2 credits per generation'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('text_to_video.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('text_to_video.description')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {!generatedVideo ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('text_to_video.prompt_label')}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('text_to_video.prompt_placeholder') || 'Describe the video you want to generate...'}
                  className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none placeholder:text-gray-900 text-gray-900"
                  maxLength={maxCharacters}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {t('text_to_video.prompt_tip')}
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
                  {t('text_to_video.examples_title')}
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

              <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-sm font-medium text-orange-900">
                      {t('text_to_video.credits_note_title') || 'Credits Required'}
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      {t('text_to_video.credits_note') || 'This feature requires 2 credits per video generation.'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  !prompt.trim() || isGenerating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('text_to_video.generating')} {Math.round(processingProgress)}%
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {t('text_to_video.generate')}
                  </>
                )}
              </button>

              {isGenerating && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    {t('text_to_video.generating_tip') || 'Video generation may take a few minutes...'}
                  </p>
                </div>
              )}

              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🎬</span>
                  <div>
                    <p className="text-sm font-medium text-purple-900">
                      {t('text_to_video.tip_title')}
                    </p>
                    <p className="text-sm text-purple-700 mt-1">
                      {t('text_to_video.tip_content')}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div>
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {t('text_to_video.your_prompt')}
                </p>
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  {prompt}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {t('text_to_video.generated_video')}
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-900">
                  <video
                    src={generatedVideo}
                    controls
                    autoPlay
                    loop
                    className="w-full"
                    onLoadedData={() => setVideoLoaded(true)}
                  >
                    {t('text_to_video.video_error') || 'Your browser does not support the video tag.'}
                  </video>
                  {!videoLoaded && (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={handleDownload}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('text_to_video.download')}
                </button>
                <button
                  onClick={handleGenerateAnother}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  {t('text_to_video.generate_another')}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('text_to_video.features_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🎥</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('text_to_video.feature1')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('text_to_video.feature1_desc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('text_to_video.feature2')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('text_to_video.feature2_desc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🎨</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('text_to_video.feature3')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('text_to_video.feature3_desc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">📱</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('text_to_video.feature4')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('text_to_video.feature4_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('text_to_video.faq_title')}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">
                {t('text_to_video.faq_q1')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('text_to_video.faq_a1')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('text_to_video.faq_q2')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('text_to_video.faq_a2')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('text_to_video.faq_q3')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('text_to_video.faq_a3')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('text_to_video.faq_q4')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('text_to_video.faq_a4')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
