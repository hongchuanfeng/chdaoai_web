import SubtitleFormatConversion from '@/components/SubtitleFormatConversion'
import AudioToolInfo from '@/components/AudioToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subtitle Format Conversion - Convert Subtitle Formats',
  description: 'Convert subtitle files between different formats like SRT, VTT, ASS, and more.',
}

export default function LangSubtitleFormatConversionPage() {
  const exampleImages = [
    '/subtitles/conversion/1.jpg',
    '/subtitles/conversion/2.jpg',
    '/subtitles/conversion/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <SubtitleFormatConversion />
      <AudioToolInfo toolKey="subtitle_format_conversion" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

