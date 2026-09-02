import PrivacyPolicy from '@/components/PrivacyPolicy'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function LangPrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PrivacyPolicy />
    </div>
  )
}
