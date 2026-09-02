import PDFTool from '@/components/PDFTool'
import PDFToolInfo from '@/components/PDFToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PDF to Audio - Convert PDF to Speech',
  description: 'Convert PDF to audio narration with our AI-powered tool.',
}

export default function LangPdfToAudioPage() {
  const exampleImages = [
    '/pdf/audio/1.jpg',
    '/pdf/audio/2.jpg',
    '/pdf/audio/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PDFTool toolKey="pdf_to_audio" />
      <PDFToolInfo toolKey="pdf_to_audio" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

