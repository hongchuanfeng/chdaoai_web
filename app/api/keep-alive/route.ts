import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Insert log record with timestamp
    const { error } = await supabase
      .from('keep_alive_logs')
      .insert({
        timestamp: new Date().toISOString(),
        log: `Keep-alive request at ${new Date().toISOString()}`,
      })

    if (error) {
      console.error('Error inserting keep-alive log:', error)
      return NextResponse.json(
        { error: 'Failed to log keep-alive request' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: 'success' })
  } catch (error: any) {
    console.error('Keep-alive error:', error)
    return NextResponse.json(
      { error: error.message || 'Keep-alive request failed' },
      { status: 500 }
    )
  }
}
