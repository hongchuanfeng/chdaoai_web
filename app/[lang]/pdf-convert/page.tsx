import PDFConvertTool from '@/components/PDFConvertTool'
import PDFToolInfo from '@/components/PDFToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PDF Convert - Convert PDF Files',
  description: 'Convert PDF to various formats with our AI-powered tool.',
}

export default function LangPdfConvertPage() {
  const exampleImages = [
    '/pdf/convert/1.jpg',
    '/pdf/convert/2.jpg',
    '/pdf/convert/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PDFConvertTool toolKey="pdf-convert" />
      <PDFToolInfo toolKey="pdf_convert" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

