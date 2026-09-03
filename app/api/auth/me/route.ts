import { NextResponse } from 'next/server'
import { getUserFromCookies, getUserById } from '@/lib/mysql'

export async function GET() {
  try {
    const user = await getUserFromCookies()
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits
      }
    })
  } catch (error) {
    console.error('Error getting user:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
