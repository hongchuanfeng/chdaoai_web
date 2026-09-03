import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth'

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsers = await query<any[]>(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    )

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const userId = generateUUID()

    await query(
      'INSERT INTO users (id, email, password, credits) VALUES (?, ?, ?, ?)',
      [userId, email.toLowerCase(), hashedPassword, 100]
    )

    // Generate JWT token
    const token = generateToken({ id: userId, email: email.toLowerCase() })

    const response = NextResponse.json(
      { 
        success: true, 
        user: { id: userId, email: email.toLowerCase() } 
      },
      { status: 201 }
    )

    // Set auth cookie
    const cookie = setAuthCookie(token)
    response.cookies.set(cookie.name, cookie.value, cookie.options as any)

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
