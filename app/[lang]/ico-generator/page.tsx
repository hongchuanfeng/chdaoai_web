import IcoGenerator from '@/components/IcoGenerator'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ICO Generator - Create ICO Icons',
  description: 'Generate ICO icons from your images for websites and applications.',
}

export default function LangIcoGeneratorPage() {
  const exampleImages = [
    '/image/ico/1.jpg',
    '/image/ico/2.jpg',
    '/image/ico/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <IcoGenerator />
      <ImageToolInfo toolKey="ico_generator" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

