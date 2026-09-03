'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AuthCallback() {
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || 'en'

  useEffect(() => {
    // Since we're using email/password auth now, 
    // the callback page just redirects to profile
    router.replace(`/${lang}/profile`)
  }, [router, lang])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
