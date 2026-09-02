import ImageHosting from '@/components/ImageHosting'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Image Hosting - Upload Images to Cloud',
  description: 'Upload images to the cloud and get shareable links. Fast, free, and reliable image hosting service.',
}

export default function LangImageHostingPage() {
  const exampleImages = [
    '/image/mosaic/1.jpg',
    '/image/mosaic/2.jpg',
    '/image/mosaic/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <ImageHosting />
      <ImageToolInfo toolKey="image_hosting" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}
