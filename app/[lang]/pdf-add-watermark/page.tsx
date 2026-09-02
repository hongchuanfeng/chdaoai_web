import PDFAddWatermarkTool from '@/components/PDFAddWatermarkTool'
import PDFToolInfo from '@/components/PDFToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PDF Add Watermark - Add Watermark to PDF',
  description: 'Add text or image watermarks to your PDF documents with customizable options.',
  keywords: ['pdf watermark', 'add watermark to pdf', 'pdf tools', 'watermark pdf'],
}

export default function LangPdfAddWatermarkPage() {
  const exampleImages = [
    '/pdf/watermark/1.jpg',
    '/pdf/watermark/2.jpg',
    '/pdf/watermark/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PDFAddWatermarkTool toolKey="pdf-add-watermark" />
      <PDFToolInfo toolKey="pdf_add_watermark" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}
