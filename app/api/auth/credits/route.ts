import { NextResponse } from 'next/server'
import { getUserFromCookies, getUserById } from '@/lib/mysql'

export async function GET() {
  try {
    const currentUser = await getUserFromCookies()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserById(currentUser.id)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      credits: user.credits
    })
  } catch (error) {
    console.error('Error getting credits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
