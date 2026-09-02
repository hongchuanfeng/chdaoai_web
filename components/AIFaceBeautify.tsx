'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState } from 'react'

export default function AIFaceBeautify() {
  const { t } = useLanguage()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

    try {
      const response = await fetch('/api/ai-face-beautify', {
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
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">{t('ai_face_beautify.title')}</h1>
      <p className="text-center text-gray-600 mb-8">
        {t('ai_face_beautify.description')}
      </p>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 mb-4"
        />

        {preview && (
          <div className="mb-4">
            <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedFile || loading}
          className="w-full bg-rose-600 text-white py-3 rounded-lg font-semibold hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? t('ai_face_beautify.processing') : `${t('ai_face_beautify.process')} (1 ${t('ai_face_beautify.credits') || '积分'})`}
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
