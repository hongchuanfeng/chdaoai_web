import EbookWatermarkRemoval from '@/components/EbookWatermarkRemoval'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'eBook Watermark Removal - Remove Watermarks from eBooks',
  description: 'Remove watermarks from eBooks with our easy-to-use tool.',
}

export default function LangEbookWatermarkRemovalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <EbookWatermarkRemoval />
      <CTA />
    </div>
  )
}
