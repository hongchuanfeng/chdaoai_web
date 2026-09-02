import MergeImages from '@/components/MergeImages'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Merge Images - Combine Multiple Images',
  description: 'Merge multiple images into one with customizable layouts.',
}

export default function LangMergeImagesPage() {
  const exampleImages = [
    '/image/merge/1.jpg',
    '/image/merge/2.jpg',
    '/image/merge/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <MergeImages />
      <ImageToolInfo toolKey="merge_images" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

