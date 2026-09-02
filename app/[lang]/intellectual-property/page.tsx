import IntellectualProperty from '@/components/IntellectualProperty'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Intellectual Property',
}

export default function LangIntellectualPropertyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <IntellectualProperty />
    </div>
  )
}
