'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  credits: number
  created_at?: string
}

export default function Profile() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState<number>(0)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setCredits(data.user.credits || 0)
        } else {
          // Not logged in, redirect to login
          router.push(`/${language}/auth/login`)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        router.push(`/${language}/auth/login`)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [router, language])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 flex justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const initial = user.email.charAt(0).toUpperCase()

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-black">Profile</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-3xl text-white font-bold">{initial}</span>
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-bold text-black">User</h2>
            <p className="text-black">{user.email}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-4 text-black">Account Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-black"
              />
            </div>
          </div>
        </div>

        <div className="border-t mt-6 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-black">Subscription</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-black">Free Plan</p>
            <p className="text-sm text-black">{credits} credits remaining</p>
            <button className="mt-2 text-primary-600 hover:text-primary-700 font-medium">
              Upgrade to Pro
            </button>
          </div>
        </div>

        <div className="border-t mt-6 pt-6">
          <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
