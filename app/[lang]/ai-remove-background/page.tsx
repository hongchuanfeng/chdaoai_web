import AIRemoveBackground from '@/components/AIRemoveBackground'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Remove Background - Intelligent Background Removal Tool',
  description: 'Use our advanced AI-powered tool to remove backgrounds from images automatically. Perfect for product photos, portraits, and more with high-quality edge preservation.',
}

export default function LangAIRemoveBackgroundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white">
      <AIRemoveBackground />
      <CTA />
    </div>
  )
}
