import DocumentToEbook from '@/components/DocumentToEbook'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Document to eBook - Convert Documents to eBooks',
  description: 'Convert documents to eBook format with our easy-to-use tool.',
}

export default function LangDocumentToEbookPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <DocumentToEbook />
      <CTA />
    </div>
  )
}
