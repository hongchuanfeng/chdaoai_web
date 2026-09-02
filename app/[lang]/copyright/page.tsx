import Copyright from '@/components/Copyright'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Copyright',
}

export default function LangCopyrightPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Copyright />
    </div>
  )
}
