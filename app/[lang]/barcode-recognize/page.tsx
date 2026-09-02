import BarcodeRecognize from '@/components/BarcodeRecognize'
import BarcodeRecognizeInfo from '@/components/BarcodeRecognizeInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Barcode Recognize - Scan Barcodes',
  description: 'Recognize barcodes from images or camera with our easy-to-use tool.',
}

export default function LangBarcodeRecognizePage() {
  const exampleImages = [
    '/barcode/recognize/1.jpg',
    '/barcode/recognize/2.jpg',
    '/barcode/recognize/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <BarcodeRecognize toolKey="barcode_recognize" />
      <BarcodeRecognizeInfo toolKey="barcode_recognize" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

