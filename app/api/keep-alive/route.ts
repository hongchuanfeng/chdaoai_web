import { NextRequest, NextResponse } from 'next/server'
import { addKeepAliveLog } from '@/lib/mysql'

export async function GET(request: NextRequest) {
  try {
    // Insert log record with timestamp
    const log = `Keep-alive request at ${new Date().toISOString()}`
    await addKeepAliveLog(log)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Keep-alive error:', error)
    return NextResponse.json(
      { error: error.message || 'Keep-alive request failed' },
      { status: 500 }
    )
  }
}
