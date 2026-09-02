import EbookToSpeech from '@/components/EbookToSpeech'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'eBook to Speech - Convert eBooks to Audio',
  description: 'Convert eBooks to audio with natural-sounding AI voices.',
}

export default function LangEbookToSpeechPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <EbookToSpeech />
      <CTA />
    </div>
  )
}
