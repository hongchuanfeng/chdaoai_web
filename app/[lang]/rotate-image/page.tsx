import RotateImage from '@/components/RotateImage'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rotate Image - Rotate Images Online',
  description: 'Rotate your images by 90, 180, 270 degrees or custom angle.',
}

export default function LangRotateImagePage() {
  const exampleImages = [
    '/image/rotate/1.jpg',
    '/image/rotate/2.jpg',
    '/image/rotate/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <RotateImage />
      <ImageToolInfo toolKey="rotate_image" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

