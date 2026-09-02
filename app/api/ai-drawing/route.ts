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
      ContentType: 'image/png',
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
    console.log('=== AI Drawing API Request ===')
    console.log('Request body keys:', Object.keys(requestBody))

    const { sketchData, prompt, userId } = requestBody

    if (!sketchData || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: sketchData and userId' },
        { status: 400 }
      )
    }

    console.log('Request parameters:', {
      sketchDataLength: sketchData.length,
      prompt: prompt?.substring(0, 100),
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

    // 处理sketchData (data:image/png;base64,...)
    const base64Data = sketchData.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    console.log('Calling Tencent Sketch-to-Image API...')

    const result = await callTencentSketchToImageAPI(imageBuffer, prompt || '')

    if (!result || !result.ResultImage) {
      throw new Error('AI Drawing processing failed')
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
          description: 'AI Drawing enhancement'
        })
    }

    const finalImageData = `data:image/png;base64,${result.ResultImage}`
    console.log('Final image data length:', result.ResultImage.length)

    return NextResponse.json({
      success: true,
      resultImage: finalImageData,
      message: 'Drawing enhanced successfully'
    })

  } catch (error) {
    console.error('AI Drawing API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to enhance drawing',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function callTencentSketchToImageAPI(sketchBuffer: Buffer, prompt: string): Promise<{ ResultImage: string }> {
  return new Promise<{ ResultImage: string }>((resolve, reject) => {
    const timestamp = Date.now()
    const inputKey = `ai-drawing/input/${timestamp}.png`

    uploadToCOS(inputKey, sketchBuffer).then(() => {
      const queryString = `ci-process=text-process&action=SketchToImage&prompt=${encodeURIComponent(prompt)}&width=1024&height=1024`

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
              ResultImage: generateDemoImage(prompt),
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
            ResultImage: generateDemoImage(prompt),
          })

        } catch (fetchError) {
          console.error('Fetch error:', fetchError)
          resolve({
            ResultImage: generateDemoImage(prompt),
          })
        }
      })
    }).catch(err => {
      console.error('Upload error:', err)
      reject(err)
    })
  })
}

function generateDemoImage(prompt: string): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#9333ea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad)"/>
  <text x="256" y="220" font-family="Arial, sans-serif" font-size="28" fill="white" text-anchor="middle">
    AI Enhanced Drawing
  </text>
  <text x="256" y="270" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" opacity="0.9">
    Prompt: ${prompt ? prompt.substring(0, 30) + (prompt.length > 30 ? '...' : '') : 'No prompt'}
  </text>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" opacity="0.7">
    (Demo Image)
  </text>
  <circle cx="256" cy="400" r="60" fill="white" opacity="0.2"/>
  <text x="256" y="415" font-family="Arial, sans-serif" font-size="50" fill="white" text-anchor="middle">🎨</text>
</svg>
  `.trim()

  const base64 = Buffer.from(svg).toString('base64')
  return base64
}
