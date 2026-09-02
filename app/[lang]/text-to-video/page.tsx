import TextToVideo from '@/components/TextToVideo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Text to Video - Generate Videos from Text',
  description: 'Use our AI-powered tool to generate stunning videos from text descriptions. Create unique video content with AI.',
}

export default function LangTextToVideoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <TextToVideo />
      <CTA />
    </div>
  )
}
