import SubtitleTranslation from '@/components/SubtitleTranslation'
import AudioToolInfo from '@/components/AudioToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subtitle Translation - Translate Subtitles to Different Languages',
  description: 'Translate your subtitle files to different languages with our AI-powered tool.',
}

export default function LangSubtitleTranslationPage() {
  const exampleImages = [
    '/subtitles/translation/1.jpg',
    '/subtitles/translation/2.jpg',
    '/subtitles/translation/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <SubtitleTranslation />
      <AudioToolInfo toolKey="subtitle_translation" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

