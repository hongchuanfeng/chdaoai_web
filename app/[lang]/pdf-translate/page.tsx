import PDFTranslateTool from '@/components/PDFTranslateTool'
import PDFToolInfo from '@/components/PDFToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PDF Translate - Translate PDF Documents',
  description: 'Translate PDF documents with our AI-powered tool.',
}

export default function LangPdfTranslatePage() {
  const exampleImages = [
    '/pdf/translate/1.jpg',
    '/pdf/translate/2.jpg',
    '/pdf/translate/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PDFTranslateTool toolKey="pdf_translate" />
      <PDFToolInfo toolKey="pdf_translate" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}
