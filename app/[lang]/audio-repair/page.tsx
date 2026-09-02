import AudioRepair from '@/components/AudioRepair'
import AudioToolInfo from '@/components/AudioToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Audio Repair - Repair Damaged Audio Files',
  description: 'Use our AI-powered tool to repair damaged audio files and restore quality.',
}

export default function LangAudioRepairPage() {
  const exampleImages = [
    '/audio/repair/1.jpg',
    '/audio/repair/2.jpg',
    '/audio/repair/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <AudioRepair />
      <AudioToolInfo toolKey="audio_repair" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}
