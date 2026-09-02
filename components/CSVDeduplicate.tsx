'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

interface ParsedCSV {
  name: string
  headers: string[]
  rows: string[][]
}

export default function CSVDeduplicate() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [parsedCSV, setParsedCSV] = useState<ParsedCSV | null>(null)
  const [processing, setProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [deduplicatedContent, setDeduplicatedContent] = useState('')
  const [keepFirst, setKeepFirst] = useState(true)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [stats, setStats] = useState<{ original: number; duplicates: number; remaining: number } | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = (content: string): { headers: string[], rows: string[][] } => {
    const lines = content.split(/\r?\n/).filter(line => line.trim())
    if (lines.length === 0) return { headers: [], rows: [] }

    const parseLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = parseLine(lines[0])
    const rows = lines.slice(1).map(line => parseLine(line))
    
    return { headers, rows }
  }

  const csvToString = (headers: string[], rows: string[][]): string => {
    const escapeField = (field: string): string => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`
      }
      return field
    }
    
    const lines: string[] = []
    if (headers.length > 0) {
      lines.push(headers.map(escapeField).join(','))
    }
    rows.forEach(row => {
      lines.push(row.map(escapeField).join(','))
    })
    return lines.join('\n')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setError('')
      setDownloadUrl('')
      setDeduplicatedContent('')
      setStats(null)
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const { headers, rows } = parseCSV(content)
        setParsedCSV({ name: selectedFile.name, headers, rows })
      }
      reader.readAsText(selectedFile)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setParsedCSV(null)
    setDownloadUrl('')
    setDeduplicatedContent('')
    setStats(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeduplicate = async () => {
    if (!parsedCSV) return
    setProcessing(true)
    setError('')
    
    try {
      const seen = new Map<string, number>()
      const duplicateIndices = new Set<number>()
      
      parsedCSV.rows.forEach((row, index) => {
        let key = row.join('|||')
        if (!caseSensitive) {
          key = key.toLowerCase()
        }
        
        if (seen.has(key)) {
          duplicateIndices.add(index)
          if (!keepFirst) {
            const lastIndex = seen.get(key)
            if (lastIndex !== undefined) {
              duplicateIndices.add(lastIndex)
            }
            seen.set(key, index)
          }
        } else {
          seen.set(key, index)
        }
      })
      
      const deduplicatedRows = parsedCSV.rows.filter((_, index) => !duplicateIndices.has(index))
      
      const result = csvToString(parsedCSV.headers, deduplicatedRows)
      setDeduplicatedContent(result)
      
      const blob = new Blob([result], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      
      setStats({
        original: parsedCSV.rows.length,
        duplicates: duplicateIndices.size,
        remaining: deduplicatedRows.length
      })
    } catch (err) {
      console.error('Deduplicate error:', err)
      setError(t('csv_deduplicate.error'))
    }
    
    setProcessing(false)
  }

  const handleDownload = () => {
    if (!downloadUrl) return
    const link = document.createElement('a')
    link.href = downloadUrl
    const baseName = file?.name.replace(/\.csv$/i, '') || 'deduplicated'
    link.download = `${baseName}_deduplicated.csv`
    link.click()
  }

  const handleCopy = () => {
    if (!deduplicatedContent) return
    navigator.clipboard.writeText(deduplicatedContent)
  }

  const handleClear = () => {
    handleRemoveFile()
  }

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('nav.csv_deduplicate')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('csv_deduplicate.description')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
          {!file && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-deduplicate-upload"
              />
              <label htmlFor="csv-deduplicate-upload" className="cursor-pointer">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-lg text-gray-700 mb-2">
                  {t('csv_deduplicate.upload')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('csv_deduplicate.supported')}
                </p>
              </label>
            </div>
          )}

          {file && parsedCSV && (
            <div>
              <div className="flex justify-between items-center mb-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-700">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {parsedCSV.headers.length} {t('csv_deduplicate.columns')}, {parsedCSV.rows.length} {t('csv_deduplicate.rows')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      {t('csv_deduplicate.keep_option')}
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="keepOption"
                          checked={keepFirst}
                          onChange={() => setKeepFirst(true)}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-gray-700">{t('csv_deduplicate.keep_first')}</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="keepOption"
                          checked={!keepFirst}
                          onChange={() => setKeepFirst(false)}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="text-gray-700">{t('csv_deduplicate.keep_last')}</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="case-sensitive"
                      checked={caseSensitive}
                      onChange={(e) => setCaseSensitive(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="case-sensitive" className="text-gray-700">
                      <span className="font-semibold">{t('csv_deduplicate.case_sensitive')}</span>
                      <span className="text-gray-500 text-sm ml-2">({t('csv_deduplicate.case_sensitive_hint')})</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleDeduplicate}
                  disabled={processing}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400"
                >
                  {processing ? t('csv_deduplicate.processing') : t('csv_deduplicate.process')}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {stats && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.original}</p>
                  <p className="text-sm text-gray-600">{t('csv_deduplicate.original_rows')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.duplicates}</p>
                  <p className="text-sm text-gray-600">{t('csv_deduplicate.duplicates_found')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.remaining}</p>
                  <p className="text-sm text-gray-600">{t('csv_deduplicate.remaining_rows')}</p>
                </div>
              </div>
            </div>
          )}

          {downloadUrl && (
            <div className="space-y-4">
              <div className="border-t border-gray-200 pt-6">
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleCopy}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                  >
                    {t('csv_deduplicate.copy')}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    {t('csv_deduplicate.download')}
                  </button>
                </div>
              </div>

              <button
                onClick={handleClear}
                className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                {t('csv_deduplicate.edit')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
