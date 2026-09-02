import SubtitlesToText from '@/components/SubtitlesToText'
import AudioToolInfo from '@/components/AudioToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subtitles to Text - Convert Subtitles to Text',
  description: 'Convert your subtitle files to plain text with our AI-powered tool.',
}

export default function LangSubtitlesToTextPage() {
  const exampleImages = [
    '/subtitles/totext/1.jpg',
    '/subtitles/totext/2.jpg',
    '/subtitles/totext/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <SubtitlesToText />
      <AudioToolInfo toolKey="subtitles_to_text" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

