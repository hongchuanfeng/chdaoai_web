import PDFSplitTool from '@/components/PDFSplitTool'
import PDFToolInfo from '@/components/PDFToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PDF Split - Split PDF Files',
  description: 'Split a PDF into multiple files with our AI-powered tool.',
}

export default function LangPdfSplitPage() {
  const exampleImages = [
    '/pdf/split/1.jpg',
    '/pdf/split/2.jpg',
    '/pdf/split/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PDFSplitTool toolKey="pdf-split" />
      <PDFToolInfo toolKey="pdf_split" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

