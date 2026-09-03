import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

export async function POST() {
  try {
    const response = NextResponse.json({ success: true })

    // Clear auth cookie
    const cookie = clearAuthCookie()
    response.cookies.set(cookie.name, cookie.value, cookie.options as any)

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
