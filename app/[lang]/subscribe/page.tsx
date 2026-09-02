import Subscribe from '@/components/Subscribe'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subscribe - Premium AI Tools',
  description: 'Subscribe to access premium AI tools and features.',
}

export default function LangSubscribePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Subscribe />
    </div>
  )
}
