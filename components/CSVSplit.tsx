'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

interface ParsedCSV {
  name: string
  headers: string[]
  rows: string[][]
}

type SplitMode = 'rows' | 'files'

export default function CSVSplit() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [parsedCSV, setParsedCSV] = useState<ParsedCSV | null>(null)
  const [processing, setProcessing] = useState(false)
  const [downloadUrls, setDownloadUrls] = useState<{ name: string, url: string }[]>([])
  const [splitMode, setSplitMode] = useState<SplitMode>('rows')
  const [rowsPerFile, setRowsPerFile] = useState(1000)
  const [numFiles, setNumFiles] = useState(5)
  const [hasHeader, setHasHeader] = useState(true)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 解析CSV
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

  // CSV转字符串
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
      setDownloadUrls([])
      
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
    setDownloadUrls([])
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSplit = async () => {
    if (!parsedCSV) return
    setProcessing(true)
    setError('')
    
    try {
      const baseName = parsedCSV.name.replace(/\.csv$/i, '')
      const dataRows = parsedCSV.rows
      const headerRows = hasHeader ? [parsedCSV.headers] : []
      
      let splitData: string[][]
      
      if (splitMode === 'rows') {
        // 按行数拆分
        const rowsPer = Math.max(1, rowsPerFile)
        const numChunks = Math.ceil(dataRows.length / rowsPer)
        splitData = []
        
        for (let i = 0; i < numChunks; i++) {
          const start = i * rowsPer
          const end = Math.min(start + rowsPer, dataRows.length)
          const chunk = [...headerRows, ...dataRows.slice(start, end)]
          splitData.push(...chunk)
        }
      } else {
        // 按文件数拆分
        const num = Math.max(1, Math.min(numFiles, dataRows.length))
        const rowsPerChunk = Math.ceil(dataRows.length / num)
        splitData = []
        
        for (let i = 0; i < num; i++) {
          const start = i * rowsPerChunk
          const end = Math.min(start + rowsPerChunk, dataRows.length)
          const chunk = [...headerRows, ...dataRows.slice(start, end)]
          splitData.push(...chunk)
        }
      }
      
      // 生成分割后的文件
      const urls: { name: string, url: string }[] = []
      
      if (splitMode === 'rows') {
        const rowsPer = Math.max(1, rowsPerFile)
        const numChunks = Math.ceil(dataRows.length / rowsPer)
        
        for (let i = 0; i < numChunks; i++) {
          const start = i * rowsPer
          const end = Math.min(start + rowsPer, dataRows.length)
          
          let chunkRows: string[][]
          if (hasHeader) {
            chunkRows = [parsedCSV.headers, ...dataRows.slice(start, end)]
          } else {
            chunkRows = dataRows.slice(start, end)
          }
          
          const csvContent = csvToString(
            hasHeader ? parsedCSV.headers : [],
            chunkRows.slice(hasHeader ? 1 : 0)
          )
          
          const blob = new Blob([hasHeader ? csvToString(parsedCSV.headers, dataRows.slice(start, end)) : csvContent], { type: 'text/csv;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          urls.push({
            name: `${baseName}_part${i + 1}.csv`,
            url
          })
        }
      } else {
        const num = Math.max(1, Math.min(numFiles, dataRows.length))
        const rowsPerChunk = Math.ceil(dataRows.length / num)
        
        for (let i = 0; i < num; i++) {
          const start = i * rowsPerChunk
          const end = Math.min(start + rowsPerChunk, dataRows.length)
          
          let chunkRows: string[][]
          if (hasHeader) {
            chunkRows = [parsedCSV.headers, ...dataRows.slice(start, end)]
          } else {
            chunkRows = dataRows.slice(start, end)
          }
          
          const csvContent = csvToString(
            hasHeader ? parsedCSV.headers : [],
            chunkRows.slice(hasHeader ? 1 : 0)
          )
          
          const blob = new Blob([hasHeader ? csvToString(parsedCSV.headers, dataRows.slice(start, end)) : csvContent], { type: 'text/csv;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          urls.push({
            name: `${baseName}_part${i + 1}.csv`,
            url
          })
        }
      }
      
      setDownloadUrls(urls)
    } catch (err) {
      console.error('Split error:', err)
      setError('Split failed')
    }
    
    setProcessing(false)
  }

  const handleDownloadAll = () => {
    // 创建ZIP文件需要额外的库，这里简单处理：逐个下载
    downloadUrls.forEach((item, index) => {
      setTimeout(() => {
        const link = document.createElement('a')
        link.href = item.url
        link.download = item.name
        link.click()
      }, index * 500)
    })
  }

  const handleClear = () => {
    handleRemoveFile()
  }

  const estimatedFiles = splitMode === 'rows' 
    ? Math.ceil((parsedCSV?.rows.length || 0) / rowsPerFile)
    : Math.min(numFiles, parsedCSV?.rows.length || 0)

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('nav.csv_split')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('csv_split.description')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
          {/* 文件上传 */}
          {!file && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-split-upload"
              />
              <label htmlFor="csv-split-upload" className="cursor-pointer">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-lg text-gray-700 mb-2">
                  {t('csv_split.upload')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('csv_split.supported')}
                </p>
              </label>
            </div>
          )}

          {/* 文件信息 */}
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
                      {parsedCSV.headers.length} 列, {parsedCSV.rows.length} 行
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

              {/* 拆分选项 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">{t('csv_split.split_options')}</h3>
                
                {/* 拆分模式选择 */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setSplitMode('rows')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                      splitMode === 'rows' 
                        ? 'border-primary-500 bg-primary-50 text-primary-700' 
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-semibold">{t('csv_split.split_by_rows')}</span>
                  </button>
                  <button
                    onClick={() => setSplitMode('files')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                      splitMode === 'files' 
                        ? 'border-primary-500 bg-primary-50 text-primary-700' 
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-semibold">{t('csv_split.split_by_files')}</span>
                  </button>
                </div>

                {/* 拆分参数 */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  {splitMode === 'rows' ? (
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        {t('csv_split.rows_per_file')}
                      </label>
                      <input
                        type="number"
                        value={rowsPerFile}
                        onChange={(e) => setRowsPerFile(Math.max(1, parseInt(e.target.value) || 1))}
                        min={1}
                        max={1000000}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        {t('csv_split.num_files')}
                      </label>
                      <input
                        type="number"
                        value={numFiles}
                        onChange={(e) => setNumFiles(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                        min={1}
                        max={100}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="split-has-header"
                      checked={hasHeader}
                      onChange={(e) => setHasHeader(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="split-has-header" className="text-gray-700">
                      <span className="font-semibold">{t('csv_split.has_header')}</span>
                      <span className="text-gray-500 text-sm ml-2">({t('csv_split.has_header_hint')})</span>
                    </label>
                  </div>

                  <p className="text-sm text-gray-500">
                    预计生成 {estimatedFiles} 个文件
                  </p>
                </div>

                <button
                  onClick={handleSplit}
                  disabled={processing}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400"
                >
                  {processing ? t('csv_split.processing') : t('csv_split.split')}
                </button>
              </div>
            </div>
          )}

          {/* 错误信息 */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 下载按钮 */}
          {downloadUrls.length > 0 && (
            <div className="space-y-4">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-700 mb-4 text-center">
                  {downloadUrls.length} {t('csv_split.num_files')}
                </h3>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleDownloadAll}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    {t('csv_split.download_zip')}
                  </button>
                </div>
                <ul className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                  {downloadUrls.map((item, index) => (
                    <li key={index} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded text-sm">
                      <span className="truncate">{item.name}</span>
                      <a
                        href={item.url}
                        download={item.name}
                        className="text-primary-600 hover:text-primary-700 ml-2"
                      >
                        {t('csv_split.download_csv')}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleClear}
                className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                {t('csv_split.edit')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}