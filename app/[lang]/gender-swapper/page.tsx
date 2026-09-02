import GenderSwapper from '@/components/GenderSwapper'
import GenderSwapperInfo from '@/components/GenderSwapperInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Gender Swapper - Transform Your Look',
  description: 'Use our AI-powered gender swap tool to see yourself as the opposite gender.',
}

export default function LangGenderSwapperPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <GenderSwapper />
      <GenderSwapperInfo />
      <CTA />
    </div>
  )
}
