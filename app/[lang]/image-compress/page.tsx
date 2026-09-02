import ImageCompress from '@/components/ImageCompress'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compress Image - Reduce Image File Size',
  description: 'Compress your images to reduce file size while maintaining quality.',
}

export default function LangImageCompressPage() {
  const exampleImages = [
    '/image/compress/1.jpg',
    '/image/compress/2.jpg',
    '/image/compress/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <ImageCompress />
      <ImageToolInfo toolKey="image_compress" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

