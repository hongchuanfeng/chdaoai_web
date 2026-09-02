import VocalSeparation from '@/components/VocalSeparation'
import AudioToolInfo from '@/components/AudioToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vocal Separation - Separate Vocals from Music',
  description: 'Use our AI-powered tool to separate vocals from music tracks quickly and easily.',
}

export default function LangVocalSeparationPage() {
  const exampleImages = [
    '/audio/separation/1.jpg',
    '/audio/separation/2.jpg',
    '/audio/separation/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <VocalSeparation />
      <AudioToolInfo toolKey="vocal_separation" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}
