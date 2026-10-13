import type { Metadata } from 'next'
import Contact from '@/components/Contact'

export const metadata: Metadata = {
  title: 'Contact Us - Get in Touch | ChDaoAI',
  description: 'Get in touch with the ChDaoAI team. We are here to help with questions, support, partnerships, and feedback. Typically respond within 24 hours.',
  keywords: 'contact, support, customer service, partnership, ChDaoAI',
  openGraph: {
    title: 'Contact Us - ChDaoAI',
    description: 'Get in touch with the ChDaoAI team for support, partnerships, and feedback.',
    type: 'website',
  },
  alternates: {
    canonical: '/contact',
  },
}

export default function LangContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Contact />
    </div>
  )
}
