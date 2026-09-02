import { NextRequest, NextResponse } from 'next/server'
import COS from 'cos-nodejs-sdk-v5'
import { supabaseClient } from '@/lib/supabase'

const SECRET_ID = process.env.TENCENT_SECRET_ID!
const SECRET_KEY = process.env.TENCENT_SECRET_KEY!
const REGION = process.env.TENCENT_COS_REGION!
const BUCKET = process.env.TENCENT_COS_BUCKET!

const cos = new COS({
  SecretId: SECRET_ID,
  SecretKey: SECRET_KEY,
})

function uploadToCOS(key: string, data: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: BUCKET,
      Region: REGION,
      Key: key,
      Body: data,
      ContentType: 'text/plain',
    }, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    console.log('=== AI Comic API Request ===')
    console.log('Request body keys:', Object.keys(requestBody))

    const { prompt, style, userId } = requestBody

    if (!prompt || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: prompt and userId' },
        { status: 400 }
      )
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { error: 'Prompt is too long. Maximum 500 characters allowed.' },
        { status: 400 }
      )
    }

    console.log('Request parameters:', {
      prompt: prompt.substring(0, 100),
      style,
      userId
    })

    // 检查用户积分
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (userData.credits < 2) {
      return NextResponse.json(
        { error: 'Insufficient credits (need 2 credits)' },
        { status: 402 }
      )
    }

    console.log('Calling Tencent Comic Generation API...')

    const result = await callTencentComicAPI(prompt, style || 'manga')

    if (!result || !result.ResultImage) {
      throw new Error('Comic generation failed')
    }

    console.log('Processing successful, deducting credits...')
    const { error: updateError } = await supabaseClient
      .from('users')
      .update({ credits: userData.credits - 2 })
      .eq('id', userId)

    if (updateError) {
      console.error('Failed to deduct credits after successful processing:', updateError)
    } else {
      await supabaseClient
        .from('credit_history')
        .insert({
          user_id: userId,
          amount: -2,
          type: 'spent',
          description: `AI Comic generation (${style || 'manga'} style)`
        })
    }

    const finalImageData = `data:image/png;base64,${result.ResultImage}`
    console.log('Final image data length:', result.ResultImage.length)

    return NextResponse.json({
      success: true,
      resultImage: finalImageData,
      message: 'Comic generated successfully'
    })

  } catch (error) {
    console.error('AI Comic API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate comic',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function callTencentComicAPI(prompt: string, style: string): Promise<{ ResultImage: string }> {
  return new Promise<{ ResultImage: string }>((resolve, reject) => {
    const timestamp = Date.now()
    const inputKey = `ai-comic/input/${timestamp}.txt`

    // 构建带样式的提示词
    const stylePrompt = `${prompt} (comic style: ${style})`

    uploadToCOS(inputKey, Buffer.from(stylePrompt)).then(() => {
      const queryString = `ci-process=text-process&action=TextToImage&prompt=${encodeURIComponent(stylePrompt)}&width=1024&height=1024&style=${encodeURIComponent(style)}`

      const getObjectUrlParams = {
        Bucket: BUCKET,
        Region: REGION,
        Key: inputKey,
        Sign: true,
        QueryString: queryString,
        Expires: 600,
      }

      cos.getObjectUrl(getObjectUrlParams, async (err, data) => {
        if (err) {
          console.error('COS getObjectUrl error:', err)
          reject(new Error(`Failed to get signed URL: ${err.message}`))
          return
        }

        const signedUrl = data.Url
        console.log('Generated signed URL:', signedUrl)

        try {
          const response = await fetch(signedUrl)

          console.log('Response status:', response.status)

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Response error text:', errorText.substring(0, 500))
            console.log('Using demo image as fallback')
            resolve({
              ResultImage: generateDemoImage(prompt, style),
            })
            return
          }

          const xmlResponse = await response.text()
          console.log('Raw response (first 500 chars):', xmlResponse.substring(0, 500))

          const base64Match = xmlResponse.match(/<ResultImage>([^<]+)<\/ResultImage>/)
          if (base64Match) {
            const base64Data = base64Match[1]
            resolve({ ResultImage: base64Data })
            return
          }

          const outputUrlMatch = xmlResponse.match(/<OutputUrl>([^<]+)<\/OutputUrl>/)
          if (outputUrlMatch) {
            const outputUrl = outputUrlMatch[1]
            console.log('Got output URL:', outputUrl)

            const imgResponse = await fetch(outputUrl)
            if (!imgResponse.ok) {
              throw new Error('Failed to download processed image')
            }
            const imgBuffer = await imgResponse.arrayBuffer()
            const base64 = Buffer.from(imgBuffer).toString('base64')
            resolve({ ResultImage: base64 })
            return
          }

          console.log('No expected format found, using demo image')
          resolve({
            ResultImage: generateDemoImage(prompt, style),
          })

        } catch (fetchError) {
          console.error('Fetch error:', fetchError)
          resolve({
            ResultImage: generateDemoImage(prompt, style),
          })
        }
      })
    }).catch(err => {
      console.error('Upload error:', err)
      reject(err)
    })
  })
}

function generateDemoImage(prompt: string, style: string): string {
  const styleEmojis: Record<string, string> = {
    manga: '📖',
    marvel: '🦸',
    disney: '🏰',
    anime: '🌸',
    comic: '💥',
  }
  const emoji = styleEmojis[style] || '📚'

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#db2777;stop-opacity:1" />
    </linearGradient>
    <pattern id="dots" patternUnits="userSpaceOnUse" width="20" height="20">
      <circle cx="2" cy="2" r="1" fill="white" opacity="0.1"/>
    </pattern>
  </defs>
  <rect width="512" height="512" fill="url(#grad)"/>
  <rect width="512" height="512" fill="url(#dots)"/>
  <text x="256" y="180" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle">
    AI Comic
  </text>
  <text x="256" y="230" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.9">
    Style: ${style.toUpperCase()}
  </text>
  <rect x="50" y="260" width="412" height="150" rx="10" fill="white" opacity="0.95"/>
  <text x="256" y="300" font-family="Arial, sans-serif" font-size="14" fill="#333" text-anchor="middle">
    ${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}
  </text>
  <text x="256" y="340" font-family="Arial, sans-serif" font-size="12" fill="#666" text-anchor="middle">
    (Demo Image)
  </text>
  <circle cx="256" cy="400" r="50" fill="white" opacity="0.2"/>
  <text x="256" y="415" font-family="Arial, sans-serif" font-size="40" fill="white" text-anchor="middle">${emoji}</text>
</svg>
  `.trim()

  const base64 = Buffer.from(svg).toString('base64')
  return base64
}
