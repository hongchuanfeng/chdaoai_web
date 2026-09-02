import { NextRequest, NextResponse } from 'next/server'
import COS from 'cos-nodejs-sdk-v5'
import crypto from 'crypto'
import { supabaseClient } from '@/lib/supabase'

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
    const { imageUrl, targetGender, userId } = await request.json()

    if (!imageUrl || !targetGender || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: imageUrl, targetGender, and userId' },
        { status: 400 }
      )
    }

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

    // 扣除积分
    const { error: updateError } = await supabaseClient
      .from('users')
      .update({ credits: userData.credits - 1 })
      .eq('id', userId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to deduct credits' },
        { status: 500 }
      )
    }

    // 记录积分历史
    await supabaseClient
      .from('credit_history')
      .insert({
        user_id: userId,
        amount: -1,
        type: 'spent',
        description: 'Gender Swapper processing'
      })

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
    const inputKey = `gender-swapper/input/${timestamp}_${randomStr}.jpg`
    const outputKey = `gender-swapper/output/${timestamp}_${randomStr}_swapped.jpg`

    // 上传原始图片到COS
    await uploadToCOS(inputKey, imageData)

    // 调用腾讯云AI性别转换API
    console.log('Calling Tencent Gender Swapper API...')
    const result = await callTencentGenderSwapAPI(inputKey, outputKey, targetGender)
    console.log('Tencent API call completed, result:', result)

    if (!result || !result.ResultImage) {
      throw new Error('AI processing failed')
    }

    const finalImageData = `data:image/jpeg;base64,${result.ResultImage}`
    console.log('Final image data URL (first 100 chars):', finalImageData.substring(0, 100))
    console.log('Base64 data length:', result.ResultImage.length)

    return NextResponse.json({
      success: true,
      resultImage: finalImageData,
      message: 'Gender swap processing completed successfully'
    })

  } catch (error) {
    console.error('Gender Swapper API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process gender swap',
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

// 调用腾讯云AI性别转换API（数据万象人脸特效接口）
async function callTencentGenderSwapAPI(inputKey: string, outputKey: string, targetGender: string): Promise<{ ResultImage: string; OutputUrl?: string }> {
  // 使用COS SDK生成签名URL，这样更可靠（参考remove-watermark的实现）
  const genderParam = targetGender === 'male' ? '1' : '0' // 0：男变女，1：女变男
  const queryString = `ci-process=face-effect&type=face-gender-transformation&gender=${genderParam}`

  console.log('=== Gender Swapper API Call ===')
  console.log('Input parameters:', {
    inputKey,
    outputKey,
    targetGender,
    genderParam,
    queryString
  })

  return new Promise<{ ResultImage: string; OutputUrl?: string }>((resolve, reject) => {
    cos.getObjectUrl({
      Bucket: BUCKET,
      Region: REGION,
      Key: inputKey,
      Sign: true,
      QueryString: queryString,
      Expires: 600, // 10分钟过期
    }, async (err, data) => {
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

        // 获取响应数据 - 腾讯云返回XML格式
        const responseText = await response.text()
        console.log('Raw API Response:', responseText)

        // 解析XML响应，提取ResultImage字段
        console.log('Parsing response data...')
        let resultBase64 = ''

        // 检查是否是XML格式的响应
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
          // 可能是直接的base64数据
          console.log('Detected direct response format')
          resultBase64 = responseText.trim()
          console.log('Using direct response as base64, length:', resultBase64.length)
        }

        console.log('Base64 data preview (first 50 chars):', resultBase64.substring(0, 50))

        // 验证base64数据的有效性
        if (!resultBase64 || resultBase64.length === 0) {
          throw new Error('Empty base64 image data received')
        }

        // 将结果上传到输出位置
        const imageBuffer = Buffer.from(resultBase64, 'base64')
        await uploadToCOS(outputKey, imageBuffer)

        resolve({
          OutputUrl: `https://${BUCKET}.cos.${REGION}.myqcloud.com/${outputKey}`,
          ResultImage: resultBase64
        })
      } catch (error) {
        console.error('Request processing error:', error)
        reject(error)
      }
    })
  })
}

