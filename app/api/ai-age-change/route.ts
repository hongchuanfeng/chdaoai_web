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
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()

    console.log('User data:', userData, 'Error:', userError)

    if (userError || !userData) {
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
          description: 'AI Age Change processing'
        })
    }

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

// 调用腾讯云AI年龄变换API（数据万象人脸特效接口）
async function callTencentAgeChangeAPI(inputKey: string, outputKey: string, age: number): Promise<{ ResultImage: string }> {
  // 使用COS SDK生成签名URL，这样更可靠（参考remove-watermark的实现）
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

        // 解析响应数据
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

        // 检查是否是有效的base64格式（简单检查）
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(resultBase64.replace(/\s/g, ''))) {
          console.warn('Base64 data may not be valid format')
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

// 计算腾讯云API签名
function calculateSignature(payload: string, headers: Record<string, string>, timestamp: number, date: string, service: string): string {
  const algorithm = 'TC3-HMAC-SHA256'
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(key => `${key.toLowerCase()}:${headers[key]}`)
    .join('\n') + '\n'

  const signedHeaders = Object.keys(headers)
    .sort()
    .map(key => key.toLowerCase())
    .join(';')

  const canonicalRequest = 'POST\n/\n\n' + canonicalHeaders + signedHeaders + '\n' + hash(payload)

  const credentialScope = `${date}/${service}/tc3_request`
  const stringToSign = algorithm + '\n' + timestamp + '\n' + credentialScope + '\n' + hash(canonicalRequest)

  const secretDate = hmac(`TC3${SECRET_KEY}`, date)
  const secretService = hmac(secretDate, service)
  const secretSigning = hmac(secretService, 'tc3_request')
  const signature = hmac(secretSigning, stringToSign, 'hex') as string

  return signature
}

// 计算COS签名（用于数据万象）- 基于腾讯云COS SDK实现
function calculateCOSSignature(method: string, path: string, queryParams: URLSearchParams, headers: Record<string, string>, timestamp: number): string {
  const keyTime = `${timestamp};${timestamp + 600}`

  // 1. 计算SignKey
  const signKey = crypto.createHmac('sha1', SECRET_KEY).update(keyTime.split(';')[0]).digest()

  // 2. 构建HttpString
  let httpString = ''

  // HttpMethod (小写)
  httpString += method.toLowerCase() + '\n'

  // HttpURI
  httpString += path + '\n'

  // HttpParameters - URL参数（排序并编码）
  const sortedParams = Array.from(queryParams.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  if (sortedParams.length > 0) {
    const paramString = sortedParams.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')
    httpString += paramString + '\n'
  } else {
    httpString += '\n'
  }

  // HttpHeaders（排序并编码）
  const sortedHeaders = Object.keys(headers).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  const headerList = sortedHeaders.map(key => key.toLowerCase()).join(';')
  const headerString = sortedHeaders.map(key => {
    const keyLower = key.toLowerCase()
    const value = headers[key]
    return `${keyLower}=${encodeURIComponent(value)}`
  }).join('&')
  httpString += headerString + '\n'

  // SignedHeaders
  httpString += headerList + '\n'

  // 3. 计算StringToSign
  const sha1HttpString = crypto.createHash('sha1').update(httpString).digest('hex')
  const stringToSign = `sha1\n${keyTime}\n${sha1HttpString}\n`

  // 4. 计算最终签名
  const signature = crypto.createHmac('sha1', signKey).update(stringToSign).digest('hex')

  console.log('=== COS Signature Debug ===')
  console.log('KeyTime:', keyTime)
  console.log('Method (lowercase):', method.toLowerCase())
  console.log('Path:', path)
  console.log('Query Params:', Object.fromEntries(queryParams.entries()))
  console.log('Sorted Query Params:', sortedParams)
  console.log('Headers:', headers)
  console.log('Sorted Headers:', sortedHeaders)
  console.log('Header List:', headerList)
  console.log('Param String:', sortedParams.length > 0 ? sortedParams.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&') : '(empty)')
  console.log('Header String:', headerString)
  console.log('HttpString (raw):', JSON.stringify(httpString))
  console.log('HttpString (visible):', httpString.replace(/\n/g, '\\n'))
  console.log('SHA1(HttpString):', sha1HttpString)
  console.log('StringToSign (raw):', JSON.stringify(stringToSign))
  console.log('StringToSign (visible):', stringToSign.replace(/\n/g, '\\n'))
  console.log('Final Signature:', signature)

  return signature
}

// HMAC-SHA256 辅助函数
function hmac(key: string | Buffer, data: string, encoding?: 'hex'): string | Buffer {
  return crypto.createHmac('sha256', key).update(data).digest(encoding as any)
}

// SHA256 哈希函数
function hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}
