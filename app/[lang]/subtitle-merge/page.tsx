import SubtitleMerge from '@/components/SubtitleMerge'
import AudioToolInfo from '@/components/AudioToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subtitle Merge - Merge Multiple Subtitle Files',
  description: 'Merge multiple subtitle files into one with our easy-to-use tool.',
}

export default function LangSubtitleMergePage() {
  const exampleImages = [
    '/subtitles/merge/1.jpg',
    '/subtitles/merge/2.jpg',
    '/subtitles/merge/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <SubtitleMerge />
      <AudioToolInfo toolKey="subtitle_merge" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

