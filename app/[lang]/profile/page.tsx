import Profile from '@/components/Profile'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile - Your Account',
  description: 'Manage your account and view your subscription.',
}

export default function LangProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Profile />
    </div>
  )
}
