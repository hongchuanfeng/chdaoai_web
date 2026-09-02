import PDFToTextTool from '@/components/PDFToTextTool'
import PDFToolInfo from '@/components/PDFToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PDF to Text - Extract Text from PDF',
  description: 'Extract text from PDF with our AI-powered tool.',
}

export default function LangPdfToTextPage() {
  const exampleImages = [
    '/pdf/text/1.jpg',
    '/pdf/text/2.jpg',
    '/pdf/text/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PDFToTextTool toolKey="pdf_to_text" />
      <PDFToolInfo toolKey="pdf_to_text" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

