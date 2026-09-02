import EbookMerge from '@/components/EbookMerge'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'eBook Merge - Combine eBook Files',
  description: 'Merge multiple eBook files into one document with our easy-to-use tool.',
}

export default function LangEbookMergePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <EbookMerge />
      <CTA />
    </div>
  )
}

