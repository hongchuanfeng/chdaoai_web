import ImageMosaic from '@/components/ImageMosaic'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Image Mosaic - Add Mosaic Effect to Images',
  description: 'Add mosaic pixelation effect to your images with our easy-to-use tool.',
}

export default function LangImageMosaicPage() {
  const exampleImages = [
    '/image/mosaic/1.jpg',
    '/image/mosaic/2.jpg',
    '/image/mosaic/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <ImageMosaic />
      <ImageToolInfo toolKey="image_mosaic" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

