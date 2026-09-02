import AiComic from '@/components/AiComic'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Comic - Create Comic Art from Text',
  description: 'Transform your text descriptions into stunning comic artwork. Choose from various comic styles including manga, anime, Marvel, Disney, and more.',
}

export default function LangAiComicPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <AiComic />
      <CTA />
    </div>
  )
}
