import AddWatermark from '@/components/AddWatermark'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Add Watermark - Add Watermark to Images',
  description: 'Add text or image watermarks to protect your photos.',
}

export default function LangAddWatermarkPage() {
  const exampleImages = [
    '/image/watermark/add/1.jpg',
    '/image/watermark/add/2.jpg',
    '/image/watermark/add/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <AddWatermark />
      <ImageToolInfo toolKey="add_watermark" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

