import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, metadata } = body

    const apiUrl = process.env.CREEM_API_URL || 'https://api.creem.io'
    const apiKey = process.env.CREEM_API_KEY || ''

    console.log('[Creem Checkout] Request:', {
      apiUrl: `${apiUrl}/v1/checkouts`,
      product_id,
      metadata,
      hasApiKey: !!apiKey,
    })

    const response = await axios.post(
      `${apiUrl}/v1/checkouts`,
      {
        product_id,
        metadata,
      },
      {
        headers: {
          'x-api-key': apiKey,
        },
      }
    )

    console.log('[Creem Checkout] Response:', {
      status: response.status,
      data: JSON.stringify(response.data, null, 2),
    })

    // Check multiple possible response formats
    const checkoutUrl = 
      response.data?.url || 
      response.data?.checkout_url || 
      response.data?.checkoutUrl ||
      response.data?.redirect_url ||
      response.data?.redirectUrl

    if (!checkoutUrl) {
      console.error('[Creem Checkout] No URL found in response:', response.data)
      return NextResponse.json(
        { error: 'No checkout URL returned from Creem API', response: response.data },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: checkoutUrl })
  } catch (error: any) {
    console.error('[Creem Checkout] Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    })
    return NextResponse.json(
      { 
        error: error.response?.data?.message || error.message || 'Failed to create checkout',
        details: error.response?.data 
      },
      { status: error.response?.status || 500 }
    )
  }
}
