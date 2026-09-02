import EnlargeImage from '@/components/EnlargeImage'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Enlarge Image - AI Image Enlarger',
  description: 'Enlarge your images without losing quality using AI technology.',
}

export default function LangEnlargeImagePage() {
  const exampleImages = [
    '/image/enlarge/1.jpg',
    '/image/enlarge/2.jpg',
    '/image/enlarge/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <EnlargeImage />
      <ImageToolInfo toolKey="enlarge_image" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

