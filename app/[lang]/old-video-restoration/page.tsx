import OldVideoRestoration from '@/components/OldVideoRestoration'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Old Video Restoration - Restore Vintage Videos with AI',
  description: 'Use AI-powered tools to restore and enhance old, damaged, or low-quality videos. Bring your vintage memories back to life.',
}

export default function LangOldVideoRestorationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <OldVideoRestoration />
      <CTA />
    </div>
  )
}
