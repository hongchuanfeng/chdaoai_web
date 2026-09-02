import AudioClipMerge from '@/components/AudioClipMerge'
import AudioToolInfo from '@/components/AudioToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Audio Clip Merge - Merge Multiple Audio Clips',
  description: 'Use our AI-powered tool to merge multiple audio clips quickly and easily.',
}

export default function LangAudioClipMergePage() {
  const exampleImages = [
    '/audio/merge/1.jpg',
    '/audio/merge/2.jpg',
    '/audio/merge/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <AudioClipMerge />
      <AudioToolInfo toolKey="audio_clip_merge" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}
