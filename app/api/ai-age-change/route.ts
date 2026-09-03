import { NextRequest, NextResponse } from 'next/server'
import COS from 'cos-nodejs-sdk-v5'
import crypto from 'crypto'
import { getUserById, deductCredits, addCreditHistory } from '@/lib/mysql'

// 腾讯云配置
const SECRET_ID = process.env.TENCENT_SECRET_ID!
const SECRET_KEY = process.env.TENCENT_SECRET_KEY!
const REGION = process.env.TENCENT_REGION!
const BUCKET = process.env.TENCENT_COS_BUCKET!

// 初始化COS客户端
const cos = new COS({
  SecretId: SECRET_ID,
  SecretKey: SECRET_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    const { imageUrl, age, userId } = requestBody

    console.log('=== API Route: Received request ===')
    console.log('Request body:', requestBody)

    if (!imageUrl || !age || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: imageUrl, age, and userId' },
        { status: 400 }
      )
    }

    // 检查用户积分
    console.log('Checking user credits for userId:', userId)
    const userData = await getUserById(userId)

    console.log('User data:', userData)

    if (!userData) {
      console.error('User not found error')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (userData.credits < 1) {
      console.error('Insufficient credits error')
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      )
    }

    console.log('User has sufficient credits:', userData.credits)

    // 下载原始图片
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to download image')
    }
    const imageBuffer = await imageResponse.arrayBuffer()
    const imageData = Buffer.from(imageBuffer)

    // 生成唯一文件名
    const timestamp = Date.now()
    const randomStr = crypto.randomBytes(8).toString('hex')
    const inputKey = `ai-age-change/input/${timestamp}_${randomStr}.jpg`
    const outputKey = `ai-age-change/output/${timestamp}_${randomStr}_aged.jpg`

    console.log('Generated file keys:', { inputKey, outputKey })

    // 上传原始图片到COS
    console.log('Uploading image to COS...')
    await uploadToCOS(inputKey, imageData)
    console.log('Image uploaded successfully to:', inputKey)

    // 调用腾讯云AI年龄变换API
    console.log('Calling Tencent AI Age Change API...')
    const result = await callTencentAgeChangeAPI(inputKey, outputKey, age)
    console.log('Tencent API call completed, result:', result)

    if (!result || !result.ResultImage) {
      throw new Error('AI processing failed')
    }

    // 只有在处理成功后才扣除积分
    console.log('Processing successful, deducting credits...')
    await deductCredits(userId, 1)
    
    // 记录积分历史
    await addCreditHistory(
      userId,
      1,
      'spent',
      'AI Age Change processing'
    )

    const finalImageData = `data:image/jpeg;base64,${result.ResultImage}`
    console.log('Final image data URL (first 100 chars):', finalImageData.substring(0, 100))
    console.log('Base64 data length:', result.ResultImage.length)

    return NextResponse.json({
      success: true,
      resultImage: finalImageData,
      message: 'Age change processing completed successfully'
    })

  } catch (error) {
    console.error('AI Age Change API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process age change',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 上传文件到COS
function uploadToCOS(key: string, data: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: BUCKET,
      Region: REGION,
      Key: key,
      Body: data,
      ContentType: 'image/jpeg',
    }, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

// 调用腾讯云AI年龄变换API
async function callTencentAgeChangeAPI(inputKey: string, outputKey: string, age: number): Promise<{ ResultImage: string }> {
  const queryString = `ci-process=face-effect&type=face-age-transformation&age=${age}`

  console.log('=== AI Age Change API Call ===')
  console.log('Input parameters:', {
    inputKey,
    outputKey,
    age,
    queryString
  })

  return new Promise<{ ResultImage: string }>((resolve, reject) => {
    cos.getObjectUrl({
      Bucket: BUCKET,
      Region: REGION,
      Key: inputKey,
      Sign: true,
      QueryString: queryString,
      Expires: 600,
    }, async (err, data) => {
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
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Response error text:', errorText)
          throw new Error(`Tencent API request failed: ${response.status} ${response.statusText} - ${errorText}`)
        }

        const responseText = await response.text()
        console.log('Raw API Response:', responseText)

        let resultBase64 = ''

        if (responseText.includes('<ResultImage>')) {
          console.log('Detected XML response format')
          const resultImageMatch = responseText.match(/<ResultImage>([\s\S]*?)<\/ResultImage>/)
          if (resultImageMatch) {
            resultBase64 = resultImageMatch[1].trim()
            console.log('Extracted base64 from XML, length:', resultBase64.length)
          } else {
            throw new Error('Failed to parse XML response: ResultImage tag not found')
          }
        } else {
          console.log('Detected direct response format')
          resultBase64 = responseText.trim()
          console.log('Using direct response as base64, length:', resultBase64.length)
        }

        console.log('Base64 data preview (first 50 chars):', resultBase64.substring(0, 50))

        if (!resultBase64 || resultBase64.length === 0) {
          throw new Error('Empty base64 image data received')
        }

        resolve({
          ResultImage: resultBase64
        })
      } catch (error) {
        console.error('Request processing error:', error)
        reject(error)
      }
    })
  })
}
