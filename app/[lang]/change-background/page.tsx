import ChangeBackground from '@/components/ChangeBackground'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Change Background - Replace Image Background',
  description: 'Change or replace the background of your images with any color or image.',
}

export default function LangChangeBackgroundPage() {
  const exampleImages = [
    '/image/change-background/1.jpg',
    '/image/change-background/2.jpg',
    '/image/change-background/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <ChangeBackground />
      <ImageToolInfo toolKey="change_background" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

