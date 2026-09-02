import VideoToSpeech from '@/components/VideoToSpeech'
import VideoToolInfo from '@/components/VideoToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Video to Speech - Convert Videos to Audio',
  description: 'Extract audio from videos and convert to speech with our AI-powered tool.',
}

export default function LangVideoToSpeechPage() {
  const exampleImages = [
    '/video/speech/1.jpg',
    '/video/speech/2.jpg',
    '/video/speech/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <VideoToSpeech />
      <VideoToolInfo toolKey="video_to_speech" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

