import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import COS from 'cos-nodejs-sdk-v5'
import { 
  getUserById, 
  createUser, 
  deductCredits, 
  addCreditHistory,
  createConversion,
  getUserFromCookies 
} from '@/lib/mysql'
import bcrypt from 'bcryptjs'

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
    // Get user from cookies using JWT
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromCookies()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check and initialize user credits
    let userData = await getUserById(user.id)
    
    if (!userData) {
      // Create new user with welcome bonus
      const hashedPassword = await bcrypt.hash('oauth_user_' + user.id, 10)
      await createUser(user.id, user.email, hashedPassword, 5)
      
      // Record initial credits
      await addCreditHistory(user.id, 5, 'initial', 'Welcome bonus - 5 free credits')
      
      userData = await getUserById(user.id)
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

    let resultUrl = imageUrl

    // 构造处理参数（query string，不带 ?）
    let processingQuery = ''

    if (x && y && width && height) {
      // 前端传入的是矩形区域，把矩形转换为 MaskPoly 多边形坐标
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
      const urlSafeBase64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')

      processingQuery = `ci-process=ImageRepair&MaskPoly=${encodeURIComponent(urlSafeBase64)}`
    } else {
      processingQuery = 'imageMogr2/auto-orient/quality/90'
    }

    resultUrl = `${imageUrl}?${processingQuery}`

    // 下载处理结果再回传到 COS
    try {
      const signedProcessingUrl = await getSignedUrl(key, processingQuery)
      console.log('[remove-watermark] processing URL', { signedProcessingUrl })
      const processedResponse = await fetch(signedProcessingUrl)
      console.log('[remove-watermark] processing response', {
        status: processedResponse.status,
        ok: processedResponse.ok,
        statusText: processedResponse.statusText,
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
    }

    // Deduct credit
    await deductCredits(user.id, 1)

    // Save conversion record
    const conversionId = await createConversion(user.id, imageUrl, resultUrl)

    // Record credit history (spent)
    await addCreditHistory(user.id, 1, 'spent', 'Watermark removal', String(conversionId))

    return NextResponse.json({ resultUrl })
  } catch (error: any) {
    console.error('Error removing watermark:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to remove watermark' },
      { status: 500 }
    )
  }
}
