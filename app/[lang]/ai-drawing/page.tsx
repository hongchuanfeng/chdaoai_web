import AiDrawing from '@/components/AiDrawing'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Drawing - Create Art from Your Sketches',
  description: 'Use AI to enhance your hand-drawn sketches into beautiful artwork. Draw, describe, and let AI transform your creations.',
}

export default function LangAiDrawingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <AiDrawing />
      <CTA />
    </div>
  )
}
