'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState } from 'react'

interface EbookToolProps {
  toolKey: string
}

export default function EbookTool({ toolKey }: EbookToolProps) {
  const { t } = useLanguage()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files)
      setFiles(fileArray)
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    // Placeholder for actual functionality
    setTimeout(() => {
      setUploading(false)
    }, 2000)
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const clearFiles = () => {
    setFiles([])
  }

  const getAcceptedFormats = () => {
    if (toolKey === 'ebook_watermark_removal') {
      return '.epub,.pdf'
    } else if (toolKey === 'ebook_to_speech' || toolKey === 'ebook_subtitles') {
      return '.epub,.pdf,.txt'
    } else if (toolKey === 'ebook_format_conversion') {
      return '.epub,.pdf,.mobi,.azw3,.txt,.docx'
    }
    return '.epub,.pdf,.mobi,.azw3'
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
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition">
            <input
              type="file"
              accept={getAcceptedFormats()}
              onChange={handleFileChange}
              className="hidden"
              id="ebook-upload"
              multiple={toolKey === 'ebook_merge'}
            />
            <label htmlFor="ebook-upload" className="cursor-pointer">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-lg text-gray-700 mb-2">
                {files.length > 0 
                  ? `${files.length} files selected` 
                  : t(`${toolKey.replace(/-/g, '_')}.upload`)
                }
              </p>
              <p className="text-sm text-gray-500">
                {t(`${toolKey.replace(/-/g, '_')}.supported`)}
              </p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-700">
                    Selected Files
                  </h3>
                  <button
                    onClick={clearFiles}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li key={index} className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded">
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-gray-400 hover:text-red-500 ml-2"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400"
              >
                {uploading 
                  ? t(`${toolKey.replace(/-/g, '_')}.processing`) 
                  : t(`${toolKey.replace(/-/g, '_')}.process`)
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

