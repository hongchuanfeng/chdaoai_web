'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState } from 'react'

export default function AIAgeChange() {
  const { t } = useLanguage()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [targetAge, setTargetAge] = useState(30)

  // 示例图片数据
  const examples = [
    { before: '/age/b1.png', after: '/age/a1.png', index: 1 },
    { before: '/age/b2.png', after: '/age/a2.png', index: 2 },
    { before: '/age/b3.png', after: '/age/a3.png', index: 3 },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
      setResult(null)
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) return

    setLoading(true)
    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('age', targetAge.toString())

    try {
      const response = await fetch('/api/ai-age-change', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data.resultUrl)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">{t('ai_age_change.title')}</h1>
      <p className="text-center text-gray-600 mb-8">
        {t('ai_age_change.description')}
      </p>

      {/* 示例展示区域 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900">{t('ai_age_change.effect_show')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {examples.map((example, index) => (
            <div key={index} className="text-center">
              <div className="mb-2 text-sm font-medium text-gray-700">{t('ai_age_change.example')} {example.index}</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('ai_age_change.examples_before')}</div>
                  <img 
                    src={example.before} 
                    alt={`${t('ai_age_change.example')} ${example.index} ${t('ai_age_change.examples_before')}`} 
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('ai_age_change.examples_after')}</div>
                  <img 
                    src={example.after} 
                    alt={`${t('ai_age_change.example')} ${example.index} ${t('ai_age_change.examples_after')}`} 
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-4"
        />

        {preview && (
          <div className="mb-4">
            <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ai_age_change.target_age')}: {targetAge}
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={targetAge}
            onChange={(e) => setTargetAge(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedFile || loading}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? t('ai_age_change.processing') : `${t('ai_age_change.process')} (1 ${t('ai_age_change.credits') || '积分'})`}
        </button>

        {result && (
          <div className="mt-4">
            <img src={result} alt="Result" className="max-h-64 mx-auto rounded-lg" />
          </div>
        )}
      </div>
    </div>
  )
}
