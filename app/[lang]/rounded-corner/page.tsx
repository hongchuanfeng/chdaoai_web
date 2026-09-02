import RoundedCorner from '@/components/RoundedCorner'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rounded Corner - Add Rounded Corners to Images',
  description: 'Add rounded corners to your images with customizable radius.',
}

export default function LangRoundedCornerPage() {
  const exampleImages = [
    '/image/rounded-corner/1.jpg',
    '/image/rounded-corner/2.jpg',
    '/image/rounded-corner/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <RoundedCorner />
      <ImageToolInfo toolKey="rounded_corner" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

