import AITextToImage from '@/components/AITextToImage'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Text to Image - Generate Images from Text',
  description: 'Use our AI-powered tool to generate stunning images from text descriptions. Create unique artwork, illustrations, and more.',
}

export default function LangAITextToImagePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <AITextToImage />
      <CTA />
    </div>
  )
}
