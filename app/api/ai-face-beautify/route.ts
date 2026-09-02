import { NextRequest, NextResponse } from 'next/server'
import COS from 'cos-nodejs-sdk-v5'
import crypto from 'crypto'
import { supabaseClient } from '@/lib/supabase'

// 腾讯云配置
const SECRET_ID = process.env.TENCENT_SECRET_ID!
const SECRET_KEY = process.env.TENCENT_SECRET_KEY!
const REGION = process.env.TENCENT_COS_REGION!
const BUCKET = process.env.TENCENT_COS_BUCKET!

// 初始化COS客户端
const cos = new COS({
  SecretId: SECRET_ID,
  SecretKey: SECRET_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    console.log('=== AI Face Beautify API Request ===')
    console.log('Request body:', requestBody)

    const { imageUrl, whitening, skinSmooth, faceSlim, eyeEnlarge, userId } = requestBody

    if (!imageUrl || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: imageUrl and userId' },
        { status: 400 }
      )
    }

    console.log('Request parameters:', {
      imageUrl: imageUrl.substring(0, 100) + '...', // 只显示前100个字符
      whitening,
      skinSmooth,
      faceSlim,
      eyeEnlarge,
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

    if (userData.credits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      )
    }

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
    const inputKey = `ai-face-beautify/input/${timestamp}_${randomStr}.jpg`
    const outputKey = `ai-face-beautify/output/${timestamp}_${randomStr}_beautified.jpg`

    // 上传原始图片到COS
    await uploadToCOS(inputKey, imageData)

    // 调用腾讯云AI美颜API
    console.log('Calling Tencent AI Face Beautify API...')
    const result = await callTencentFaceBeautifyAPI(inputKey, outputKey, whitening, skinSmooth, faceSlim, eyeEnlarge)
    console.log('Tencent API call completed, result:', result)

    if (!result || !result.ResultImage) {
      throw new Error('AI processing failed')
    }

    // 只有在处理成功后才扣除积分
    console.log('Processing successful, deducting credits...')
    const { error: updateError } = await supabaseClient
      .from('users')
      .update({ credits: userData.credits - 1 })
      .eq('id', userId)

    if (updateError) {
      console.error('Failed to deduct credits after successful processing:', updateError)
      // 处理成功但扣费失败，返回成功结果但记录错误
      console.warn('Credits were not deducted due to database error')
    } else {
      // 记录积分历史
      await supabaseClient
        .from('credit_history')
        .insert({
          user_id: userId,
          amount: -1,
          type: 'spent',
          description: 'AI Face Beautify processing'
        })
    }

    const finalImageData = `data:image/jpeg;base64,${result.ResultImage}`
    console.log('Final image data URL (first 100 chars):', finalImageData.substring(0, 100))
    console.log('Base64 data length:', result.ResultImage.length)

    const responseData = {
      success: true,
      resultImage: finalImageData.substring(0, 100) + '...', // 只在日志中显示前100个字符
      message: 'Face beautify processing completed successfully'
    }

    console.log('=== AI Face Beautify API Response ===')
    console.log('Response data:', responseData)

    return NextResponse.json({
      success: true,
      resultImage: finalImageData,
      message: 'Face beautify processing completed successfully'
    })

  } catch (error) {
    console.error('AI Face Beautify API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process face beautify',
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

// 调用腾讯云AI美颜API（数据万象人脸特效接口）
async function callTencentFaceBeautifyAPI(inputKey: string, outputKey: string, whitening: number, skinSmooth: number, faceSlim: number, eyeEnlarge: number): Promise<{ ResultImage: string; OutputUrl?: string }> {
  // 使用COS SDK生成签名URL，这样更可靠（参考remove-watermark和ai-age-change的实现）
  const queryString = `ci-process=face-effect&type=face-beautify&whitening=${whitening}&smoothing=${skinSmooth}&face-slim=${faceSlim}&eye-enlarge=${eyeEnlarge}`

  console.log('=== AI Face Beautify API Call ===')
  console.log('Input parameters:', {
    inputKey,
    outputKey,
    whitening,
    skinSmooth,
    faceSlim,
    eyeEnlarge,
    queryString
  })

  return new Promise<{ ResultImage: string; OutputUrl?: string }>((resolve, reject) => {
    const getObjectUrlParams = {
      Bucket: BUCKET,
      Region: REGION,
      Key: inputKey,
      Sign: true,
      QueryString: queryString,
      Expires: 600, // 10分钟过期
    }

    console.log('COS getObjectUrl parameters:', getObjectUrlParams)

    cos.getObjectUrl(getObjectUrlParams, async (err, data) => {
      if (err) {
        console.error('COS getObjectUrl error:', err)
        reject(new Error(`Failed to get signed URL: ${err.message}`))
        return
      }

      const signedUrl = data.Url
      console.log('Generated signed URL:', signedUrl)

      try {
        // 使用签名URL发送请求
        const response = await fetch(signedUrl)

        console.log('Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Response error text:', errorText)
          throw new Error(`Tencent API request failed: ${response.status} ${response.statusText} - ${errorText}`)
        }

        // 获取响应数据 - 腾讯云数据万象返回XML格式
        const xmlResponse = await response.text()
        console.log('Raw XML response (first 500 chars):', xmlResponse.substring(0, 500))

        // 解析XML响应，提取Base64图片数据
        const base64Match = xmlResponse.match(/<ResultImage>([^<]+)<\/ResultImage>/)
        if (!base64Match) {
          console.error('No ResultImage found in XML response')
          throw new Error('Invalid response format: no ResultImage found')
        }

        const base64Data = base64Match[1]
        console.log('Extracted base64 data (first 100 chars):', base64Data.substring(0, 100))
        console.log('Base64 data length:', base64Data.length)

        resolve({
          ResultImage: base64Data,
          OutputUrl: `https://${BUCKET}.cos.${REGION}.myqcloud.com/${outputKey}`
        })

      } catch (fetchError) {
        console.error('Fetch error:', fetchError)
        reject(fetchError)
      }
    })
  })
}

