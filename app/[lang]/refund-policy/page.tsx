import RefundPolicy from '@/components/RefundPolicy'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy',
}

export default function LangRefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <RefundPolicy />
    </div>
  )
}
