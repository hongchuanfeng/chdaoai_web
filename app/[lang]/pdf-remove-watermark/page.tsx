import PDFRemoveWatermarkTool from '@/components/PDFRemoveWatermarkTool'
import PDFToolInfo from '@/components/PDFToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PDF Remove Watermark - Remove Watermarks from PDF',
  description: 'Remove watermarks from PDF documents easily and quickly.',
  keywords: ['pdf remove watermark', 'remove watermark from pdf', 'pdf tools'],
}

export default function LangPdfRemoveWatermarkPage() {
  const exampleImages = [
    '/pdf/watermark/1.jpg',
    '/pdf/watermark/2.jpg',
    '/pdf/watermark/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PDFRemoveWatermarkTool toolKey="pdf-remove-watermark" />
      <PDFToolInfo toolKey="pdf_remove_watermark" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}
