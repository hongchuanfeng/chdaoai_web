import ViewExif from '@/components/ViewExif'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'View EXIF - View Image EXIF Data',
  description: 'View and extract EXIF metadata from your images.',
}

export default function LangViewExifPage() {
  const exampleImages = [
    '/image/exif/1.jpg',
    '/image/exif/2.jpg',
    '/image/exif/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <ViewExif />
      <ImageToolInfo toolKey="view_exif" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

