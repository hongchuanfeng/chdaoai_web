import AIAgeChange from '@/components/AIAgeChange'
import AIAgeChangeInfo from '@/components/AIAgeChangeInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Age Change - See Yourself at Different Ages',
  description: 'Use our AI-powered age transformation tool to see what you might look like at different ages.',
}

export default function LangAIAgeChangePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <AIAgeChange />
      <AIAgeChangeInfo />
      <CTA />
    </div>
  )
}
