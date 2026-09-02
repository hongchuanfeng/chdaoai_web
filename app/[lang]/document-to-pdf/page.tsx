import DocumentToPDFTool from '@/components/DocumentToPDFTool'
import PDFToolInfo from '@/components/PDFToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Document to PDF - Convert Documents to PDF',
  description: 'Convert Word, Text, and other documents to PDF format.',
  keywords: ['document to pdf', 'word to pdf', 'txt to pdf', 'convert document', 'pdf converter'],
}

export default function LangDocumentToPDFPage() {
  const exampleImages = [
    '/pdf/document-to-pdf/1.jpg',
    '/pdf/document-to-pdf/2.jpg',
    '/pdf/document-to-pdf/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <DocumentToPDFTool toolKey="document_to_pdf" />
      <PDFToolInfo toolKey="document_to_pdf" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}
