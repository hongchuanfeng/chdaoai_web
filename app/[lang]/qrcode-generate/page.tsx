import QRCodeGenerate from '@/components/QRCodeGenerate'
import QRCodeGenerateInfo from '@/components/QRCodeGenerateInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'QR Code Generate - Create QR Codes',
  description: 'Generate QR codes (single or batch) with our easy-to-use tool.',
}

export default function LangQRCodeGeneratePage() {
  const exampleImages = [
    '/qrcode/generate/1.jpg',
    '/qrcode/generate/2.jpg',
    '/qrcode/generate/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <QRCodeGenerate toolKey="qrcode_generate" />
      <QRCodeGenerateInfo toolKey="qrcode_generate" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

