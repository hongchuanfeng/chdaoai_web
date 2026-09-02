import AddText from '@/components/AddText'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Add Text - Add Text to Images',
  description: 'Add text overlays to your images with customizable fonts, colors, and positions.',
}

export default function LangAddTextPage() {
  const exampleImages = [
    '/image/add-text/1.jpg',
    '/image/add-text/2.jpg',
    '/image/add-text/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <AddText />
      <ImageToolInfo toolKey="add_text" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

