import ImageFormatConversion from '@/components/ImageFormatConversion'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Image Format Conversion - Convert Image Formats',
  description: 'Convert your images between different formats like JPG, PNG, WebP, and more.',
}

export default function LangImageFormatConversionPage() {
  const exampleImages = [
    '/image/format-conversion/1.jpg',
    '/image/format-conversion/2.jpg',
    '/image/format-conversion/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <ImageFormatConversion />
      <ImageToolInfo toolKey="image_format_conversion" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

