import { NextRequest, NextResponse } from 'next/server'
import * as crypto from 'crypto'
import { query } from '@/lib/db'

function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    // Get signature from header
    const signature = request.headers.get('creem-signature')
    const rawBody = await request.text()
    
    console.log('[Creem Webhook] Request received:', {
      timestamp: new Date().toISOString(),
      hasSignature: !!signature,
    })

    // Parse body
    let body
    try {
      body = JSON.parse(rawBody)
    } catch (parseError) {
      console.error('[Creem Webhook] JSON parse error:', parseError)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Verify signature
    const secret = process.env.CREEM_WEBHOOK_SECRET || ''
    
    if (!secret) {
      console.error('[Creem Webhook] ERROR: CREEM_WEBHOOK_SECRET is not set!')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    const computedSignature = generateSignature(rawBody, secret)

    if (signature !== computedSignature) {
      console.error('[Creem Webhook] Signature verification FAILED')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Check if payment is completed
    let transactionId: string | null = null
    let userId: string | null = null
    let credits = 0

    if (body.eventType === 'subscription.paid') {
      transactionId = body.object.last_transaction_id
      userId = body.object.metadata?.internal_customer_id
      const productId = body.object.product?.id
      
      // Determine credits based on product
      if (productId === process.env.CREEM_PRODUCT_BASIC_ID || productId === process.env.NEXT_PUBLIC_CREEM_PRODUCT_BASIC_ID) credits = 30
      else if (productId === process.env.CREEM_PRODUCT_STANDARD_ID || productId === process.env.NEXT_PUBLIC_CREEM_PRODUCT_STANDARD_ID) credits = 100
      else if (productId === process.env.CREEM_PRODUCT_PREMIUM_ID || productId === process.env.NEXT_PUBLIC_CREEM_PRODUCT_PREMIUM_ID) credits = 350
    } else if (body.eventType === 'checkout.completed' && body.object.order?.status === 'paid') {
      transactionId = body.object.order.transaction
      userId = body.object.metadata?.internal_customer_id 
        || body.object.customer?.metadata?.internal_customer_id
        || body.object.subscription?.metadata?.internal_customer_id
      const productId = body.object.product?.id || body.object.order?.product
      
      // Determine credits based on product
      if (productId === process.env.CREEM_PRODUCT_BASIC_ID || productId === process.env.NEXT_PUBLIC_CREEM_PRODUCT_BASIC_ID) credits = 30
      else if (productId === process.env.CREEM_PRODUCT_STANDARD_ID || productId === process.env.NEXT_PUBLIC_CREEM_PRODUCT_STANDARD_ID) credits = 100
      else if (productId === process.env.CREEM_PRODUCT_PREMIUM_ID || productId === process.env.NEXT_PUBLIC_CREEM_PRODUCT_PREMIUM_ID) credits = 350
    }

    if (!transactionId || !userId) {
      console.error('[Creem Webhook] Missing required data:', { transactionId, userId })
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    // Check if transaction already exists
    const existingOrders = await query<any[]>(
      'SELECT id FROM subscription_orders WHERE transaction_id = ?',
      [transactionId]
    )

    if (existingOrders.length > 0) {
      console.log('[Creem Webhook] Order already processed:', existingOrders[0].id)
      return NextResponse.json({ message: 'Order already processed' })
    }

    // Get product_id from different possible locations
    const productId = body.object.product?.id || body.object.order?.product || body.object.subscription?.product
    const amount = body.object.product?.price || body.object.order?.amount || 0

    // Add to subscription_orders
    const insertResult = await query<any>(
      'INSERT INTO subscription_orders (transaction_id, user_id, product_id, amount, credits, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [transactionId, userId, productId, amount, credits, 'completed']
    )

    console.log('[Creem Webhook] Order created:', insertResult)

    // Update user credits
    const users = await query<any[]>(
      'SELECT credits FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      console.error('[Creem Webhook] User not found:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentCredits = users[0].credits || 0
    await query(
      'UPDATE users SET credits = credits + ? WHERE id = ?',
      [credits, userId]
    )

    // Record credit history
    await query(
      'INSERT INTO credit_history (user_id, amount, type, description, related_order_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [userId, credits, 'earned', `Subscription payment - ${credits} credits`, transactionId]
    )

    console.log('[Creem Webhook] Processing completed successfully')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Creem Webhook] Unexpected error:', {
      message: error.message,
      stack: error.stack,
    })
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
