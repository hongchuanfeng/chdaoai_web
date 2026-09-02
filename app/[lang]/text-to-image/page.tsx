import TextToImage from '@/components/TextToImage'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Text to Image - Convert Text into Images',
  description: 'Convert your text into beautiful images with customizable fonts, colors, and backgrounds.',
}

export default function LangTextToImagePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <TextToImage />
      <CTA />
    </div>
  )
}
