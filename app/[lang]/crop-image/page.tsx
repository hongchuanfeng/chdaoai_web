import CropImage from '@/components/CropImage'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crop Image - Crop Images Online',
  description: 'Crop your images to the perfect size with our easy-to-use crop tool.',
}

export default function LangCropImagePage() {
  const exampleImages = [
    '/image/crop/1.jpg',
    '/image/crop/2.jpg',
    '/image/crop/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <CropImage />
      <ImageToolInfo toolKey="crop_image" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

