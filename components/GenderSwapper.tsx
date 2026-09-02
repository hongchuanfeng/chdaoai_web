'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState } from 'react'

export default function GenderSwapper() {
  const { t } = useLanguage()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 示例图片数据
  const examples = [
    { before: '/gender/b1.png', after: '/gender/a1.png', index: 1 },
    { before: '/gender/b2.png', after: '/gender/a2.png', index: 2 },
    { before: '/gender/b3.png', after: '/gender/a3.png', index: 3 },
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

    try {
      const response = await fetch('/api/gender-swapper', {
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
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">{t('gender_swapper.title')}</h1>
      <p className="text-center text-gray-600 mb-8">
        {t('gender_swapper.description')}
      </p>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 mb-4"
        />

        {preview && (
          <div className="mb-4">
            <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedFile || loading}
          className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? t('gender_swapper.processing') : `${t('gender_swapper.process')} (1 ${t('gender_swapper.credits') || '积分'})`}
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
