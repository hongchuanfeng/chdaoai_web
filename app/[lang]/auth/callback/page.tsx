'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallback() {
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) || 'en'
  const supabase = createClientComponentClient()
  const [status, setStatus] = useState('验证中...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setStatus('登录成功，正在跳转...')
        router.push(`/${lang}/profile`)
        router.refresh()
      } else {
        setStatus('登录失败，请重试')
        router.push(`/${lang}/auth/login`)
      }
    }

    handleAuthCallback()
  }, [router, supabase, lang])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  )
}

