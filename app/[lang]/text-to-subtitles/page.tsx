import TextToSubtitles from '@/components/TextToSubtitles'
import VideoToolInfo from '@/components/VideoToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Text to Subtitles - Convert Text to Subtitle Files',
  description: 'Convert your text content to subtitle files with our AI-powered tool.',
}

export default function LangTextToSubtitlesPage() {
  const exampleImages = [
    '/subtitles/text/1.jpg',
    '/subtitles/text/2.jpg',
    '/subtitles/text/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <TextToSubtitles />
      <VideoToolInfo toolKey="text_to_subtitles" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

