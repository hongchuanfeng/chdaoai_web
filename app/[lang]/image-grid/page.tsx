import ImageGrid from '@/components/ImageGrid'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Image Grid - Create Image Grids',
  description: 'Split your images into grids or create beautiful image grids.',
}

export default function LangImageGridPage() {
  const exampleImages = [
    '/image/grid/1.jpg',
    '/image/grid/2.jpg',
    '/image/grid/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <ImageGrid />
      <ImageToolInfo toolKey="image_grid" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}

