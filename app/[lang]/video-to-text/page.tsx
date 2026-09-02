import VideoToText from '@/components/VideoToText'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Video to Text - Extract Text from Videos',
  description: 'Convert video content to text with our AI-powered video to text extraction tool.',
}

export default function LangVideoToTextPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <VideoToText />
      <CTA />
    </div>
  )
}
