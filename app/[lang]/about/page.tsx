import About from '@/components/About'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
}

export default function LangAboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <About />
    </div>
  )
}
