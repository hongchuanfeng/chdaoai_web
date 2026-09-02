'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useRef } from 'react'
import EXIF from 'exif-js'

interface ExifInfo {
  [key: string]: string
}

const exifLabels: { [key: string]: { zh: string; en: string } } = {
  'Make': { zh: '相机品牌', en: 'Camera Make' },
  'Model': { zh: '相机型号', en: 'Camera Model' },
  'DateTime': { zh: '拍摄时间', en: 'Date Taken' },
  'DateTimeOriginal': { zh: '原始拍摄时间', en: 'Original Date' },
  'ExposureTime': { zh: '曝光时间', en: 'Exposure Time' },
  'FNumber': { zh: '光圈', en: 'Aperture' },
  'ISO': { zh: 'ISO感光度', en: 'ISO' },
  'FocalLength': { zh: '焦距', en: 'Focal Length' },
  'FocalLengthIn35mmFilm': { zh: '等效焦距', en: 'Focal Length (35mm)' },
  'ExposureBias': { zh: '曝光补偿', en: 'Exposure Bias' },
  'MeteringMode': { zh: '测光模式', en: 'Metering Mode' },
  'Flash': { zh: '闪光灯', en: 'Flash' },
  'WhiteBalance': { zh: '白平衡', en: 'White Balance' },
  'Orientation': { zh: '方向', en: 'Orientation' },
  'Software': { zh: '软件', en: 'Software' },
  'Artist': { zh: '作者', en: 'Artist' },
  'Copyright': { zh: '版权', en: 'Copyright' },
  'ImageWidth': { zh: '图片宽度', en: 'Image Width' },
  'ImageHeight': { zh: '图片高度', en: 'Image Height' },
}

function getExifLabel(key: string, lang: string): string {
  if (exifLabels[key]) {
    return lang === 'zh' ? exifLabels[key].zh : exifLabels[key].en
  }
  return key
}

function formatExposureTime(value: number): string {
  if (value >= 1) {
    return value + 's'
  }
  return '1/' + Math.round(1 / value) + 's'
}

function formatFNumber(value: number): string {
  return 'f/' + value.toFixed(1)
}

function formatFocalLength(value: number): string {
  return value.toFixed(0) + 'mm'
}

function formatMeteringMode(value: number): string {
  const modes: { [key: number]: { zh: string; en: string } } = {
    1: { zh: '平均测光', en: 'Average' },
    2: { zh: '中央重点测光', en: 'Center-weighted' },
    3: { zh: '点测光', en: 'Spot' },
    4: { zh: '多点测光', en: 'Multi-spot' },
    5: { zh: '多区测光', en: 'Multi-segment' },
    6: { zh: '部分测光', en: 'Partial' },
  }
  return modes[value] ? (modes[value].zh + ' / ' + modes[value].en) : value.toString()
}

function formatFlash(value: number): string {
  const flashZh = (value & 1) ? '闪光' : '未闪光'
  const flashEn = (value & 1) ? 'Flash fired' : 'No flash'
  return flashZh + ' / ' + flashEn
}

function formatWhiteBalance(value: number): string {
  return value === 0 ? '自动 / Auto' : '手动 / Manual'
}

function formatOrientation(value: number): string {
  const orientations: { [key: number]: { zh: string; en: string } } = {
    1: { zh: '正常', en: 'Normal' },
    2: { zh: '水平翻转', en: 'Flipped Horizontal' },
    3: { zh: '旋转180°', en: 'Rotated 180°' },
    4: { zh: '垂直翻转', en: 'Flipped Vertical' },
    5: { zh: ' transpose', en: 'Transpose' },
    6: { zh: '顺时针旋转90°', en: 'Rotated 90° CW' },
    7: { zh: ' transverse', en: 'Transverse' },
    8: { zh: '逆时针旋转90°', en: 'Rotated 90° CCW' },
  }
  return orientations[value] ? (orientations[value].zh + ' / ' + orientations[value].en) : value.toString()
}

export default function ViewExif() {
  const { t, language } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [exifData, setExifData] = useState<ExifInfo | null>(null)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [gpsData, setGpsData] = useState<ExifInfo | null>(null)
  const [hasExif, setHasExif] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setSelectedImage(result)
        
        // 获取图片尺寸
        const img = new Image()
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height })
          
          // 提取 EXIF 数据
          const imgEl = img as any
          EXIF.getData(imgEl, function(this: any) {
            const exif: ExifInfo = {}
            let hasData = false
            
            // 读取主要 EXIF 数据
            const tags = [
              'Make', 'Model', 'DateTime', 'DateTimeOriginal',
              'ExposureTime', 'FNumber', 'ISO', 'FocalLength',
              'FocalLengthIn35mmFilm', 'ExposureBias', 'MeteringMode',
              'Flash', 'WhiteBalance', 'Orientation', 'Software',
              'Artist', 'Copyright', 'ImageWidth', 'ImageHeight'
            ]
            
            for (const tag of tags) {
              const value = EXIF.getTag(this, tag)
              if (value !== undefined) {
                hasData = true
                let formattedValue = value
                
                if (tag === 'ExposureTime' && typeof value === 'number') {
                  formattedValue = formatExposureTime(value)
                } else if (tag === 'FNumber' && typeof value === 'number') {
                  formattedValue = formatFNumber(value)
                } else if (tag === 'FocalLength' && typeof value === 'number') {
                  formattedValue = formatFocalLength(value)
                } else if (tag === 'MeteringMode' && typeof value === 'number') {
                  formattedValue = formatMeteringMode(value)
                } else if (tag === 'Flash' && typeof value === 'number') {
                  formattedValue = formatFlash(value)
                } else if (tag === 'WhiteBalance' && typeof value === 'number') {
                  formattedValue = formatWhiteBalance(value)
                } else if (tag === 'Orientation' && typeof value === 'number') {
                  formattedValue = formatOrientation(value)
                }
                
                exif[getExifLabel(tag, language)] = formattedValue.toString()
              }
            }
            
            // 读取 GPS 数据
            const gps: ExifInfo = {}
            const lat = EXIF.getTag(this, 'GPSLatitude')
            const latRef = EXIF.getTag(this, 'GPSLatitudeRef')
            const lon = EXIF.getTag(this, 'GPSLongitude')
            const lonRef = EXIF.getTag(this, 'GPSLongitudeRef')
            
            if (lat && lon && latRef && lonRef) {
              const latDec = convertDMSToDD(lat, latRef)
              const lonDec = convertDMSToDD(lon, lonRef)
              gps['GPS 纬度 / GPS Latitude'] = latDec.toFixed(6) + '°'
              gps['GPS 经度 / GPS Longitude'] = lonDec.toFixed(6) + '°'
              hasData = true
            }
            
            setHasExif(hasData)
            setExifData(exif)
            setGpsData(Object.keys(gps).length > 0 ? gps : null)
          })
        }
        img.src = result
      }
      reader.readAsDataURL(file)
    }
  }

  function convertDMSToDD(dms: number[], ref: string): number {
    let dd = dms[0] + dms[1] / 60 + dms[2] / 3600
    if (ref === 'S' || ref === 'W') {
      dd = dd * -1
    }
    return dd
  }

  const handleClear = () => {
    setSelectedImage(null)
    setExifData(null)
    setGpsData(null)
    setImageDimensions(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('nav.view_exif')}</h1>
        <p className="text-lg text-gray-600">{t('view_exif.description')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        {!selectedImage ? (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-primary-500 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-lg text-gray-600">{t('view_exif.upload')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('view_exif.supported')}</p>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <img 
                ref={imgRef}
                src={selectedImage} 
                alt="Selected" 
                className="max-w-full max-h-96 rounded-lg" 
              />
            </div>

            {/* 图片基本信息 */}
            {imageDimensions && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t('view_exif.basic_info')}</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500">{t('view_exif.image_width')}:</span>
                      <span className="ml-2 text-gray-900 font-medium">{imageDimensions.width} px</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('view_exif.image_height')}:</span>
                      <span className="ml-2 text-gray-900 font-medium">{imageDimensions.height} px</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EXIF 数据 */}
            {exifData && Object.keys(exifData).length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t('view_exif.data')}</h3>
                <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {Object.entries(exifData).map(([key, value]) => (
                        <tr key={key} className="border-b border-gray-200 last:border-0">
                          <td className="py-2 px-4 font-medium text-gray-700">{key}</td>
                          <td className="py-2 px-4 text-gray-600">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GPS 数据 */}
            {gpsData && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{t('view_exif.gps_data')}</h3>
                <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {Object.entries(gpsData).map(([key, value]) => (
                        <tr key={key} className="border-b border-gray-200 last:border-0">
                          <td className="py-2 px-4 font-medium text-gray-700">{key}</td>
                          <td className="py-2 px-4 text-gray-600">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 无 EXIF 数据提示 */}
            {hasExif === false && (
              <div className="mt-6 text-center text-gray-500">
                <p>{t('view_exif.no_exif')}</p>
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleClear}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                {t('common.clear')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

