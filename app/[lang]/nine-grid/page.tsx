import ImageNineGrid from '@/components/ImageNineGrid'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Image Nine Grid - Split Image into 9 Parts',
  description: 'Split a single image into 9 equal parts (3x3 grid) for easy sharing on social media.',
}

export default function LangImageNineGridPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <ImageNineGrid />
      <CTA />
    </div>
  )
}
