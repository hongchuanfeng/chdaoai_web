import AudioToSubtitles from '@/components/AudioToSubtitles'
import AudioToolInfo from '@/components/AudioToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Audio to Subtitles - Generate Subtitles from Audio',
  description: 'Use our AI-powered tool to generate subtitles from audio files quickly and accurately.',
}

export default function LangAudioToSubtitlesPage() {
  const exampleImages = [
    '/audio/subtitles/1.jpg',
    '/audio/subtitles/2.jpg',
    '/audio/subtitles/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <AudioToSubtitles />
      <AudioToolInfo toolKey="audio_to_subtitles" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}
