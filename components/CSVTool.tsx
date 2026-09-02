'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'

interface CSVToolProps {
  toolKey: string
}

interface ParsedCSV {
  name: string
  headers: string[]
  rows: string[][]
}

export default function CSVTool({ toolKey }: CSVToolProps) {
  const { t } = useLanguage()
  const [files, setFiles] = useState<File[]>([])
  const [parsedFiles, setParsedFiles] = useState<ParsedCSV[]>([])
  const [processing, setProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [mergedContent, setMergedContent] = useState('')
  const [hasHeader, setHasHeader] = useState(true)
  const [skipHeader, setSkipHeader] = useState(true)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 解析CSV
  const parseCSV = (content: string): { headers: string[], rows: string[][] } => {
    const lines = content.split(/\r?\n/).filter(line => line.trim())
    if (lines.length === 0) return { headers: [], rows: [] }

    // 解析CSV行，处理引号内的逗号
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

  // 检测文件编码
  const detectEncoding = (content: string): string => {
    // 简单检测UTF-8
    try {
      const decoder = new TextDecoder('utf-8', { fatal: true })
      decoder.decode(new TextEncoder().encode(content))
      return 'utf-8'
    } catch {
      return 'latin1'
    }
  }

  // 将CSV转换为字符串
  const csvToString = (headers: string[], rows: string[][], includeHeader: boolean): string => {
    const escapeField = (field: string): string => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`
      }
      return field
    }
    
    const lines: string[] = []
    if (includeHeader && headers.length > 0) {
      lines.push(headers.map(escapeField).join(','))
    }
    rows.forEach(row => {
      lines.push(row.map(escapeField).join(','))
    })
    return lines.join('\n')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const allFiles = [...files, ...newFiles]
      setFiles(allFiles)
      setError('')
      setDownloadUrl('')
      setMergedContent('')
      
      // 解析所有文件
      const promises = allFiles.map(file => {
        return new Promise<ParsedCSV>((resolve) => {
          const reader = new FileReader()
          reader.onload = (event) => {
            const content = event.target?.result as string
            const { headers, rows } = parseCSV(content)
            resolve({ name: file.name, headers, rows })
          }
          reader.readAsText(file)
        })
      })
      
      Promise.all(promises).then(parsed => {
        setParsedFiles(parsed)
      })
    }
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    setFiles(newFiles)
    
    const newParsedFiles = [...parsedFiles]
    newParsedFiles.splice(index, 1)
    setParsedFiles(newParsedFiles)
    
    setDownloadUrl('')
    setMergedContent('')
  }

  const clearFiles = () => {
    setFiles([])
    setParsedFiles([])
    setDownloadUrl('')
    setMergedContent('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 拖拽排序
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    
    const newFiles = [...files]
    const newParsedFiles = [...parsedFiles]
    
    const draggedFile = newFiles[draggedIndex]
    const draggedParsed = newParsedFiles[draggedIndex]
    
    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedFile)
    
    newParsedFiles.splice(draggedIndex, 1)
    newParsedFiles.splice(index, 0, draggedParsed)
    
    setFiles(newFiles)
    setParsedFiles(newParsedFiles)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleMerge = async () => {
    if (parsedFiles.length < 2) return
    setProcessing(true)
    setError('')
    
    try {
      // 收集所有唯一的列名
      const allHeaders = new Set<string>()
      parsedFiles.forEach(parsed => {
        parsed.headers.forEach(h => allHeaders.add(h))
      })
      const unifiedHeaders = Array.from(allHeaders)
      
      // 合并所有数据行
      const mergedRows: string[][] = []
      
      parsedFiles.forEach((parsed, index) => {
        // 建立列映射
        const headerIndexMap: { [key: string]: number } = {}
        parsed.headers.forEach((h, i) => {
          headerIndexMap[h] = i
        })
        
        // 处理每一行
        const rowsToAdd = skipHeader && index > 0 ? parsed.rows.slice(1) : parsed.rows
        
        rowsToAdd.forEach(row => {
          const newRow: string[] = []
          
          // 按统一表头的顺序填充数据
          unifiedHeaders.forEach(header => {
            const originalIndex = headerIndexMap[header]
            if (originalIndex !== undefined && originalIndex < row.length) {
              newRow.push(row[originalIndex])
            } else {
              newRow.push('')
            }
          })
          
          mergedRows.push(newRow)
        })
      })
      
      // 生成合并后的CSV
      const result = csvToString(unifiedHeaders, mergedRows, hasHeader)
      setMergedContent(result)
      
      const blob = new Blob([result], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
    } catch (err) {
      console.error('Merge error:', err)
      setError('Merge failed')
    }
    
    setProcessing(false)
  }

  const handleDownload = () => {
    if (!downloadUrl) return
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = 'merged.csv'
    link.click()
  }

  const handleCopy = () => {
    if (!mergedContent) return
    navigator.clipboard.writeText(mergedContent)
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

        <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
          {/* 文件上传 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
              multiple={toolKey === 'csv-merge'}
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg text-gray-700 mb-2">
                {files.length > 0 
                  ? `${files.length} ${t('csv.files_selected')}` 
                  : t(`${toolKey.replace(/-/g, '_')}.upload`)
                }
              </p>
              <p className="text-sm text-gray-500">
                {t(`${toolKey.replace(/-/g, '_')}.supported`)}
              </p>
            </label>
          </div>

          {/* 文件列表 */}
          {files.length > 0 && (
            <div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-700">
                    {t('csv.selected_files')}
                  </h3>
                  <button
                    onClick={clearFiles}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    {t('csv.clear_all')}
                  </button>
                </div>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li 
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex justify-between items-center bg-gray-50 px-4 py-2 rounded cursor-move ${draggedIndex === index ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        {parsedFiles[index] && (
                          <span className="text-xs text-gray-500">
                            ({parsedFiles[index].headers.length}列, {parsedFiles[index].rows.length}行)
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-gray-400 hover:text-red-500 ml-2"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-2">{t('csv_merge.reorder_hint')}</p>
              </div>

              {/* 合并选项 */}
              {files.length >= 2 && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="has-header"
                      checked={hasHeader}
                      onChange={(e) => setHasHeader(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="has-header" className="text-gray-700">
                      <span className="font-semibold">{t('csv_merge.has_header')}</span>
                      <span className="text-gray-500 text-sm ml-2">({t('csv_merge.has_header_hint')})</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="skip-header"
                      checked={skipHeader}
                      onChange={(e) => setSkipHeader(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="skip-header" className="text-gray-700">
                      <span className="font-semibold">{t('csv_merge.skip_header')}</span>
                      <span className="text-gray-500 text-sm ml-2">({t('csv_merge.skip_header_hint')})</span>
                    </label>
                  </div>
                </div>
              )}

              <button
                onClick={handleMerge}
                disabled={processing || files.length < 2}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:bg-gray-400 mt-4"
              >
                {processing 
                  ? t(`${toolKey.replace(/-/g, '_')}.processing`) 
                  : t(`${toolKey.replace(/-/g, '_')}.process`)
                }
              </button>
            </div>
          )}

          {files.length > 0 && files.length < 2 && (
            <p className="text-center text-gray-500 text-sm">
              {t('csv_merge.min_files')}
            </p>
          )}

          {/* 错误信息 */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 下载和复制按钮 */}
          {downloadUrl && (
            <div className="space-y-4">
              <div className="border-t border-gray-200 pt-6">
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleCopy}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                  >
                    {t('csv_merge.copy')}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    {t('csv_merge.download')}
                  </button>
                </div>
              </div>

              <button
                onClick={clearFiles}
                className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                {t('csv_merge.edit')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}