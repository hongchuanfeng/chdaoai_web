import Disclaimer from '@/components/Disclaimer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimer',
}

export default function LangDisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Disclaimer />
    </div>
  )
}
