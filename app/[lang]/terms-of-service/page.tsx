import TermsOfService from '@/components/TermsOfService'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
}

export default function LangTermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TermsOfService />
    </div>
  )
}
