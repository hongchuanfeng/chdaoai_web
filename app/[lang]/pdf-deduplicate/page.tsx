import PDFDeduplicateTool from '@/components/PDFDeduplicateTool'
import PDFToolInfo from '@/components/PDFToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PDF Deduplicate - Remove Duplicate Pages',
  description: 'Remove duplicate pages from PDF with our AI-powered tool.',
}

export default function LangPdfDeduplicatePage() {
  const exampleImages = [
    '/pdf/deduplicate/1.jpg',
    '/pdf/deduplicate/2.jpg',
    '/pdf/deduplicate/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PDFDeduplicateTool toolKey="pdf-deduplicate" />
      <PDFToolInfo toolKey="pdf_deduplicate" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

