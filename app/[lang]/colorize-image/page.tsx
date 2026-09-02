import ColorizeImage from '@/components/ColorizeImage'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Colorize Image - Colorize Black and White Photos',
  description: 'Automatically colorize black and white photos using AI technology.',
}

export default function LangColorizeImagePage() {
  const exampleImages = [
    '/image/colorize/1.jpg',
    '/image/colorize/2.jpg',
    '/image/colorize/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <ColorizeImage />
      <ImageToolInfo toolKey="colorize_image" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

