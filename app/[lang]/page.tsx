import RemoveWatermarkInline from '@/components/RemoveWatermarkInline'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import UseCases from '@/components/UseCases'
import FAQ from '@/components/FAQ'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Remove Watermark - AI-Powered Watermark Removal | RemoveWatermark',
  description: 'Remove watermarks from your photos instantly with our AI-powered tool. Fast, easy, and free to try.',
  keywords: 'remove watermark, watermark removal, AI watermark, photo editing',
  openGraph: {
    title: 'Remove Watermark - AI-Powered Watermark Removal',
    description: 'Remove watermarks from your photos instantly with our AI-powered tool.',
    type: 'website',
  },
}

export default function LangHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <RemoveWatermarkInline />
      <Features />
      <HowItWorks />
      <UseCases />
      <FAQ />
      <CTA />
    </div>
  )
}
