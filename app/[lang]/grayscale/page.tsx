import Grayscale from '@/components/Grayscale'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Grayscale - Convert Image to Grayscale',
  description: 'Convert your images to grayscale with our easy-to-use online tool.',
}

export default function LangGrayscalePage() {
  const exampleImages = [
    '/image/grayscale/1.jpg',
    '/image/grayscale/2.jpg',
    '/image/grayscale/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Grayscale />
      <ImageToolInfo toolKey="grayscale" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

