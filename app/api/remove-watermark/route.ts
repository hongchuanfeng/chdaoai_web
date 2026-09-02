import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import COS from 'cos-nodejs-sdk-v5'

const cos = new COS({
  SecretId: process.env.TENCENT_SECRET_ID,
  SecretKey: process.env.TENCENT_SECRET_KEY,
})

// Generate a signed GET URL for COS object with optional query string
function getSignedUrl(key: string, queryString: string = ''): Promise<string> {
  return new Promise((resolve, reject) => {
    cos.getObjectUrl(
      {
        Bucket: process.env.TENCENT_COS_BUCKET!,
        Region: process.env.TENCENT_COS_REGION!,
        Key: key,
        Sign: true,
        // remove leading "?" if present, CI / ImageRepair 等处理参数通过 query 传入
        QueryString: queryString.replace(/^\?/, ''),
      },
      (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data.Url)
        }
      }
    )
  })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user credits
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      // If user doesn't exist, create with 5 free credits
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          credits: 5,
        })

      if (insertError) {
        return NextResponse.json({ error: 'Failed to check credits' }, { status: 500 })
      }

      // Record initial credits
      await supabase
        .from('credit_history')
        .insert({
          user_id: user.id,
          amount: 5,
          type: 'initial',
          description: 'Welcome bonus - 5 free credits',
          created_at: new Date().toISOString(),
        })
    }

    const credits = userData?.credits || 5
    if (credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits. Please subscribe.' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    const x = formData.get('x') as string | null
    const y = formData.get('y') as string | null
    const width = formData.get('width') as string | null
    const height = formData.get('height') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Tencent COS
    const fileName = `${Date.now()}-${file.name}`
    const key = `${process.env.TENCENT_COS_UPLOAD_DIR}${fileName}`

    await new Promise((resolve, reject) => {
      cos.putObject(
        {
          Bucket: process.env.TENCENT_COS_BUCKET!,
          Region: process.env.TENCENT_COS_REGION!,
          Key: key,
          Body: buffer,
        },
        (err, data) => {
          if (err) reject(err)
          else resolve(data)
        }
      )
    })

    const imageUrl = `https://${process.env.TENCENT_COS_BUCKET}.cos.${process.env.TENCENT_COS_REGION}.myqcloud.com${key}`

    // Log request parameters (no secrets)
    console.log('[remove-watermark] start', {
      userId: user.id,
      imageKey: key,
      imageUrl,
      area: { x, y, width, height },
    })

    // 根据腾讯云数据万象 ImageRepair 文档调用去水印接口
    // 文档：https://cloud.tencent.com/document/product/460/79042
    //
    // 处理方式一：下载时处理
    // GET /<ObjectKey>?ci-process=ImageRepair&MaskPoly=<MaskPoly> HTTP/1.1
    // 其中 MaskPoly 为多边形坐标的 URL 安全 Base64 编码

    let resultUrl = imageUrl

    // 构造处理参数（query string，不带 ?）
    let processingQuery = ''

    if (x && y && width && height) {
      // 前端传入的是矩形区域，把矩形转换为 MaskPoly 多边形坐标：
      // [[[x, y], [x+width, y], [x+width, y+height], [x, y+height]]]
      const xNum = parseInt(x, 10)
      const yNum = parseInt(y, 10)
      const wNum = parseInt(width, 10)
      const hNum = parseInt(height, 10)

      const polygon = [
        [
          [xNum, yNum],
          [xNum + wNum, yNum],
          [xNum + wNum, yNum + hNum],
          [xNum, yNum + hNum],
        ],
      ]

      const polygonJson = JSON.stringify(polygon)
      const base64 = Buffer.from(polygonJson).toString('base64')
      // URL 安全的 Base64：替换 + / 并去掉 = 号
      const urlSafeBase64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')

      // 根据文档，ImageRepair 的 query 为：ci-process=ImageRepair&MaskPoly=<MaskPoly>
      processingQuery = `ci-process=ImageRepair&MaskPoly=${encodeURIComponent(urlSafeBase64)}`
    } else {
      // 如果没有提供坐标，就不做 ImageRepair，只做一个轻量的画质优化，保持兼容
      // 注意：这里不是 ImageRepair，只是 imageMogr2 示例
      processingQuery = 'imageMogr2/auto-orient/quality/90'
    }

    // 预览用的 URL（未签名），前端不会去直接拉取私有桶内容，只作为记录
    resultUrl = `${imageUrl}?${processingQuery}`

    // 下载处理结果再回传到 COS
    try {
      // 使用带签名的 URL，避免私有桶 403
      const signedProcessingUrl = await getSignedUrl(key, processingQuery)
      console.log('[remove-watermark] processing URL', { signedProcessingUrl })
      const processedResponse = await fetch(signedProcessingUrl)
      console.log('[remove-watermark] processing response', {
        status: processedResponse.status,
        ok: processedResponse.ok,
        statusText: processedResponse.statusText,
        headers: Object.fromEntries(processedResponse.headers.entries()),
      })
      if (processedResponse.ok) {
        const processedBuffer = Buffer.from(await processedResponse.arrayBuffer())
        const resultFileName = `result-${Date.now()}-${file.name}`
        const resultKey = `${process.env.TENCENT_COS_UPLOAD_DIR}${resultFileName}`
        
        await new Promise((resolve, reject) => {
          cos.putObject(
            {
              Bucket: process.env.TENCENT_COS_BUCKET!,
              Region: process.env.TENCENT_COS_REGION!,
              Key: resultKey,
              Body: processedBuffer,
            },
            (err, data) => {
              if (err) reject(err)
              else resolve(data)
            }
          )
        })
        
        resultUrl = `https://${process.env.TENCENT_COS_BUCKET}.cos.${process.env.TENCENT_COS_REGION}.myqcloud.com${resultKey}`
        console.log('[remove-watermark] uploaded processed image', { resultUrl, resultKey })
      }
    } catch (processError) {
      console.error('Error processing image:', processError)
      // Fall back to original processing URL
    }

    // Deduct credit
    await supabase
      .from('users')
      .update({ credits: credits - 1 })
      .eq('id', user.id)

    // Save conversion record
    const { data: conversionData, error: conversionError } = await supabase
      .from('conversions')
      .insert({
        user_id: user.id,
        original_url: imageUrl,
        result_url: resultUrl,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    // Record credit history (spent)
    if (conversionData) {
      await supabase
        .from('credit_history')
        .insert({
          user_id: user.id,
          amount: 1,
          type: 'spent',
          description: 'Watermark removal',
          related_conversion_id: conversionData.id,
          created_at: new Date().toISOString(),
        })
    }

    return NextResponse.json({ resultUrl })
  } catch (error: any) {
    console.error('Error removing watermark:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to remove watermark' },
      { status: 500 }
    )
  }
}
