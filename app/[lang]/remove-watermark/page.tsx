import RemoveWatermarkInline from '@/components/RemoveWatermarkInline'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Remove Watermark - Remove Watermarks from Images',
  description: 'Remove watermarks from your images with AI-powered technology.',
}

export default function LangRemoveWatermarkPage() {
  const exampleImages = [
    '/image/watermark/remove/1.jpg',
    '/image/watermark/remove/2.jpg',
    '/image/watermark/remove/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <RemoveWatermarkInline />
      <ImageToolInfo toolKey="image_watermark_removal" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}
