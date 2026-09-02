import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import * as crypto from 'crypto'

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
    
    // Log request details (without sensitive data)
    console.log('[Creem Webhook] Request received:', {
      timestamp: new Date().toISOString(),
      hasSignature: !!signature,
      signatureLength: signature?.length || 0,
      signaturePrefix: signature?.substring(0, 10) || 'none',
      bodyLength: rawBody.length,
      bodyPreview: rawBody.substring(0, 200),
      headers: {
        'content-type': request.headers.get('content-type'),
        'user-agent': request.headers.get('user-agent'),
      },
    })

    // Parse body
    let body
    try {
      body = JSON.parse(rawBody)
      console.log('[Creem Webhook] Parsed body:', {
        eventType: body.eventType,
        hasObject: !!body.object,
      })
    } catch (parseError) {
      console.error('[Creem Webhook] JSON parse error:', parseError)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Verify signature
    const secret = process.env.CREEM_WEBHOOK_SECRET || ''
    
    console.log('[Creem Webhook] Signature verification:', {
      hasSecret: !!secret,
      secretLength: secret.length,
      secretPrefix: secret.substring(0, 5) + '...',
      receivedSignature: signature,
      rawBodyLength: rawBody.length,
      rawBodyFirstChars: rawBody.substring(0, 50),
      rawBodyLastChars: rawBody.substring(Math.max(0, rawBody.length - 50)),
    })

    if (!secret) {
      console.error('[Creem Webhook] ERROR: CREEM_WEBHOOK_SECRET is not set!')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    const computedSignature = generateSignature(rawBody, secret)
    
    console.log('[Creem Webhook] Signature comparison:', {
      receivedSignature: signature,
      computedSignature: computedSignature,
      signaturesMatch: signature === computedSignature,
      receivedLength: signature?.length || 0,
      computedLength: computedSignature.length,
    })

    if (signature !== computedSignature) {
      console.error('[Creem Webhook] Signature verification FAILED:', {
        received: signature,
        computed: computedSignature,
        secretConfigured: !!secret,
        bodyLength: rawBody.length,
        bodyHash: crypto.createHash('sha256').update(rawBody).digest('hex').substring(0, 16),
      })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    console.log('[Creem Webhook] Signature verification SUCCESS')

    const supabase = createRouteHandlerClient({ cookies })

    // Check if payment is completed
    let transactionId: string | null = null
    let userId: string | null = null
    let credits = 0

    console.log('[Creem Webhook] Processing event:', {
      eventType: body.eventType,
      hasObject: !!body.object,
    })

    if (body.eventType === 'subscription.paid') {
      transactionId = body.object.last_transaction_id
      userId = body.object.metadata?.internal_customer_id
      const productId = body.object.product?.id
      
      console.log('[Creem Webhook] subscription.paid event:', {
        transactionId,
        userId,
        productId,
        metadata: body.object.metadata,
      })
      
      // Determine credits based on product
      if (productId === process.env.CREEM_PRODUCT_BASIC_ID || productId === process.env.NEXT_PUBLIC_CREEM_PRODUCT_BASIC_ID) credits = 30
      else if (productId === process.env.CREEM_PRODUCT_STANDARD_ID || productId === process.env.NEXT_PUBLIC_CREEM_PRODUCT_STANDARD_ID) credits = 100
      else if (productId === process.env.CREEM_PRODUCT_PREMIUM_ID || productId === process.env.NEXT_PUBLIC_CREEM_PRODUCT_PREMIUM_ID) credits = 350
    } else if (body.eventType === 'checkout.completed' && body.object.order?.status === 'paid') {
      transactionId = body.object.order.transaction
      // Try multiple ways to get userId from metadata
      userId = body.object.metadata?.internal_customer_id 
        || body.object.customer?.metadata?.internal_customer_id
        || body.object.subscription?.metadata?.internal_customer_id
      const productId = body.object.product?.id || body.object.order?.product
      
      console.log('[Creem Webhook] checkout.completed event:', {
        transactionId,
        userId,
        productId,
        orderStatus: body.object.order?.status,
        metadata: body.object.metadata,
        customerMetadata: body.object.customer?.metadata,
        subscriptionMetadata: body.object.subscription?.metadata,
      })
      
      // Determine credits based on product
      if (productId === process.env.CREEM_PRODUCT_BASIC_ID || productId === process.env.NEXT_PUBLIC_CREEM_PRODUCT_BASIC_ID) credits = 30
      else if (productId === process.env.CREEM_PRODUCT_STANDARD_ID || productId === process.env.NEXT_PUBLIC_CREEM_PRODUCT_STANDARD_ID) credits = 100
      else if (productId === process.env.CREEM_PRODUCT_PREMIUM_ID || productId === process.env.NEXT_PUBLIC_CREEM_PRODUCT_PREMIUM_ID) credits = 350
    } else {
      console.log('[Creem Webhook] Unhandled event type:', {
        eventType: body.eventType,
        orderStatus: body.object?.order?.status,
      })
    }

    console.log('[Creem Webhook] Extracted data:', {
      transactionId,
      userId,
      credits,
      hasTransactionId: !!transactionId,
      hasUserId: !!userId,
    })

    if (!transactionId || !userId) {
      console.error('[Creem Webhook] Missing required data:', {
        transactionId,
        userId,
        eventType: body.eventType,
        bodyKeys: Object.keys(body),
      })
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    // Check if transaction already exists
    console.log('[Creem Webhook] Checking for existing order:', { transactionId })
    const { data: existingOrder, error: checkError } = await supabase
      .from('subscription_orders')
      .select('id')
      .eq('transaction_id', transactionId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[Creem Webhook] Error checking existing order:', checkError)
    }

    if (existingOrder) {
      console.log('[Creem Webhook] Order already processed:', { orderId: existingOrder.id })
      return NextResponse.json({ message: 'Order already processed' })
    }

    // Get product_id from different possible locations
    const productId = body.object.product?.id || body.object.order?.product || body.object.subscription?.product
    const amount = body.object.product?.price || body.object.order?.amount || 0

    console.log('[Creem Webhook] Creating order:', {
      transactionId,
      userId,
      productId,
      amount,
      credits,
    })

    // Add to subscription_orders
    const { data: orderData, error: orderError } = await supabase
      .from('subscription_orders')
      .insert({
        transaction_id: transactionId,
        user_id: userId,
        product_id: productId,
        amount,
        credits,
        status: 'completed',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError) {
      console.error('[Creem Webhook] Error inserting order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      )
    }

    console.log('[Creem Webhook] Order created:', { orderId: orderData.id })

    // Update user credits
    console.log('[Creem Webhook] Updating user credits:', { userId, credits })
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('[Creem Webhook] Error fetching user:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user', details: userError.message },
        { status: 500 }
      )
    }

    const currentCredits = userData?.credits || 0
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: currentCredits + credits })
      .eq('id', userId)

    if (updateError) {
      console.error('[Creem Webhook] Error updating credits:', updateError)
      return NextResponse.json(
        { error: 'Failed to update credits', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('[Creem Webhook] Credits updated:', {
      userId,
      oldCredits: currentCredits,
      newCredits: currentCredits + credits,
    })

    // Record credit history
    if (orderData) {
      console.log('[Creem Webhook] Recording credit history:', {
        userId,
        amount: credits,
        orderId: orderData.id,
      })
      const { error: historyError } = await supabase
        .from('credit_history')
        .insert({
          user_id: userId,
          amount: credits,
          type: 'earned',
          description: `Subscription payment - ${credits} credits`,
          related_order_id: orderData.id,
          created_at: new Date().toISOString(),
        })

      if (historyError) {
        console.error('[Creem Webhook] Error recording credit history:', historyError)
        // Don't fail the whole request if history recording fails
      }
    }

    console.log('[Creem Webhook] Processing completed successfully')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Creem Webhook] Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
