import AudioFormatConversion from '@/components/AudioFormatConversion'
import AudioToolInfo from '@/components/AudioToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Audio Format Conversion - Convert Audio Between Formats',
  description: 'Use our AI-powered tool to convert audio between different formats quickly and easily.',
}

export default function LangAudioFormatConversionPage() {
  const exampleImages = [
    '/audio/conversion/1.jpg',
    '/audio/conversion/2.jpg',
    '/audio/conversion/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <AudioFormatConversion />
      <AudioToolInfo toolKey="audio_format_conversion" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}
