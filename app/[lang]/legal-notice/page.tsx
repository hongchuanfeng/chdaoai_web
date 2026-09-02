import LegalNotice from '@/components/LegalNotice'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal Notice',
}

export default function LangLegalNoticePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LegalNotice />
    </div>
  )
}
