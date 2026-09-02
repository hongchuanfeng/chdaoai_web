import RemoveBackground from '@/components/RemoveBackground'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Background Removal - Remove Image Backgrounds Automatically',
  description: 'Use our AI-powered tool to remove backgrounds from images automatically. Perfect for product photos, portraits, and more.',
}

export default function LangRemoveBackgroundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <RemoveBackground />
      <CTA />
    </div>
  )
}
