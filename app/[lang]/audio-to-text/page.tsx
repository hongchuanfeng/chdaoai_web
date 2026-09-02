import AudioToText from '@/components/AudioToText'
import AudioToolInfo from '@/components/AudioToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Audio to Text - Convert Speech to Text',
  description: 'Use our AI-powered tool to convert audio speech to text quickly and accurately.',
}

export default function LangAudioToTextPage() {
  const exampleImages = [
    '/audio/text/1.jpg',
    '/audio/text/2.jpg',
    '/audio/text/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <AudioToText />
      <AudioToolInfo toolKey="audio_to_text" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}
