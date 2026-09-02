import PhotoRestoration from '@/components/PhotoRestoration'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Photo Restoration - Restore Old Photos',
  description: 'Restore old, damaged photos to their original glory using AI technology.',
}

export default function LangPhotoRestorationPage() {
  const exampleImages = [
    '/image/restoration/1.jpg',
    '/image/restoration/2.jpg',
    '/image/restoration/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PhotoRestoration />
      <ImageToolInfo toolKey="photo_restoration" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

