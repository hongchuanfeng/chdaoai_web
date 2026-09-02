import AIFaceBeautify from '@/components/AIFaceBeautify'
import AIFaceBeautifyInfo from '@/components/AIFaceBeautifyInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Face Beautify - Perfect Your Portrait',
  description: 'Enhance your photos with our AI face beautification tool.',
}

export default function LangAIFaceBeautifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <AIFaceBeautify />
      <AIFaceBeautifyInfo />
      <CTA />
    </div>
  )
}
