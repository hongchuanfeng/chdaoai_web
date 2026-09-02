import BarcodeGenerate from '@/components/BarcodeGenerate'
import BarcodeGenerateInfo from '@/components/BarcodeGenerateInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Barcode Generate - Create Barcodes',
  description: 'Generate barcodes (single or batch) with our easy-to-use tool.',
}

export default function LangBarcodeGeneratePage() {
  const exampleImages = [
    '/barcode/generate/1.jpg',
    '/barcode/generate/2.jpg',
    '/barcode/generate/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <BarcodeGenerate toolKey="barcode_generate" />
      <BarcodeGenerateInfo toolKey="barcode_generate" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

