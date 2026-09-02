import QRCodeRecognize from '@/components/QRCodeRecognize'
import QRCodeRecognizeInfo from '@/components/QRCodeRecognizeInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'QR Code Recognize - Scan QR Codes',
  description: 'Recognize QR codes from images or camera with our easy-to-use tool.',
}

export default function LangQRCodeRecognizePage() {
  const exampleImages = [
    '/qrcode/recognize/1.jpg',
    '/qrcode/recognize/2.jpg',
    '/qrcode/recognize/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <QRCodeRecognize toolKey="qrcode_recognize" />
      <QRCodeRecognizeInfo toolKey="qrcode_recognize" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

