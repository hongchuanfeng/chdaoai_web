'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

export default function ImageHosting() {
  const { t } = useLanguage()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError(t('image_hosting.invalid_file') || 'Please select an image file (JPG, PNG, GIF, WebP)')
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError(t('image_hosting.file_too_large') || 'File too large (max 10MB)')
      return
    }

    setSelectedFile(file)
    setError('')
    setUploadedUrl(null)
    setCopySuccess(false)

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await fetch('/api/image-hosting', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setUploadedUrl(data.url)
    } catch (err: any) {
      setError(err.message || (t('image_hosting.error') || 'Upload failed'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleCopy = async () => {
    if (!uploadedUrl) return
    try {
      await navigator.clipboard.writeText(uploadedUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      setError(t('image_hosting.copy_failed') || 'Copy failed')
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadedUrl(null)
    setError('')
    setCopySuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Upload Area */}
        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              selectedFile ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              {previewUrl ? (
                <div className="flex flex-col items-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 rounded-lg mb-4 object-contain"
                  />
                  <p className="text-sm text-gray-600">
                    {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
                  </p>
                </div>
              ) : (
                <>
                  <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 mb-1">{t('image_hosting.upload') || 'Click to upload image'}</p>
                  <p className="text-sm text-gray-400">{t('image_hosting.supported') || 'Supports JPG, PNG, GIF, WebP (max 10MB)'}</p>
                </>
              )}
            </label>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex gap-3">
          {selectedFile && !uploadedUrl && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? (t('image_hosting.uploading') || 'Uploading...') : (t('image_hosting.upload_button') || 'Upload to Cloud')}
            </button>
          )}
          {selectedFile && (
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('image_hosting.reset') || 'Reset'}
            </button>
          )}
        </div>

        {/* Uploaded Result */}
        {uploadedUrl && (
          <div className="px-6 pb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-700 font-medium">{t('image_hosting.upload_success') || 'Upload successful!'}</p>
              </div>
              <div className="bg-white rounded-lg border border-green-200 p-3 flex items-center gap-2">
                <input
                  type="text"
                  value={uploadedUrl}
                  readOnly
                  className="flex-1 text-sm text-gray-600 bg-transparent outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    copySuccess
                      ? 'bg-green-100 text-green-700'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {copySuccess ? (t('image_hosting.copied') || 'Copied!') : (t('image_hosting.copy') || 'Copy URL')}
                </button>
              </div>
              <div className="mt-4">
                <img src={uploadedUrl} alt="Uploaded" className="max-h-64 rounded-lg mx-auto object-contain border border-gray-200" />
              </div>
              <div className="mt-4 flex gap-3">
                <a
                  href={uploadedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-primary-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  {t('image_hosting.open_image') || 'Open Image'}
                </a>
                <button
                  onClick={handleReset}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('image_hosting.upload_another') || 'Upload Another'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
