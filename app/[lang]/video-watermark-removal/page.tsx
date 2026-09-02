import VideoWatermarkRemoval from '@/components/VideoWatermarkRemoval'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Video Watermark Removal - Remove Watermarks from Videos',
  description: 'Use our AI-powered tool to remove watermarks and logos from your videos quickly and easily.',
}

export default function LangVideoWatermarkRemovalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <VideoWatermarkRemoval />
      <CTA />
    </div>
  )
}
