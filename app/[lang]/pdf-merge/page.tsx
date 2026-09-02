import PDFMergeTool from '@/components/PDFMergeTool'
import PDFToolInfo from '@/components/PDFToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PDF Merge - Combine PDF Files',
  description: 'Merge multiple PDF files into one document with our AI-powered tool.',
}

export default function LangPdfMergePage() {
  const exampleImages = [
    '/pdf/merge/1.jpg',
    '/pdf/merge/2.jpg',
    '/pdf/merge/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PDFMergeTool toolKey="pdf-merge" />
      <PDFToolInfo toolKey="pdf_merge" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

