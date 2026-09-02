import PDFToSubtitlesTool from '@/components/PDFToSubtitlesTool'
import PDFToolInfo from '@/components/PDFToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PDF to Subtitles - Convert PDF to Subtitles',
  description: 'Convert PDF content to subtitle files with our AI-powered tool.',
}

export default function LangPdfToSubtitlesPage() {
  const exampleImages = [
    '/pdf/to-subtitles/1.jpg',
    '/pdf/to-subtitles/2.jpg',
    '/pdf/to-subtitles/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PDFToSubtitlesTool toolKey="pdf_to_subtitles" />
      <PDFToolInfo toolKey="pdf_to_subtitles" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}
