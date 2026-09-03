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
    const user = await getUserFromCookies()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userData = await getUserById(user.id)
    
    if (!userData) {
      const hashedPassword = await bcrypt.hash('oauth_user_' + user.id, 10)
      await createUser(user.id, user.email, hashedPassword, 5)
      await addCreditHistory(user.id, 5, 'initial', 'Welcome bonus - 5 free credits')
      userData = await getUserById(user.id)
    }

    const credits = userData?.credits || 5
    if (credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits. Please subscribe.' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('video') as File

    if (!file) {
      return NextResponse.json({ error: 'No video provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

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

    const videoUrl = `https://${process.env.TENCENT_COS_BUCKET}.cos.${process.env.TENCENT_COS_REGION}.myqcloud.com${key}`

    console.log('[old-video-restoration] start', {
      userId: user.id,
      videoKey: key,
      videoUrl,
    })

    let resultUrl = videoUrl

    // 使用腾讯云视频增强能力处理旧视频
    const processingQuery = `ci-process=video&mode=async&jobType=1`

    resultUrl = `${videoUrl}?${processingQuery}`

    // 下载处理结果
    try {
      const signedProcessingUrl = await getSignedUrl(key, processingQuery)
      console.log('[old-video-restoration] processing URL', { signedProcessingUrl })
      
      const processedResponse = await fetch(signedProcessingUrl)
      console.log('[old-video-restoration] processing response', {
        status: processedResponse.status,
        ok: processedResponse.ok,
      })
      
      if (processedResponse.ok) {
        const processedBuffer = Buffer.from(await processedResponse.arrayBuffer())
        const resultFileName = `restored-${Date.now()}-${file.name}`
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
        console.log('[old-video-restoration] uploaded restored video', { resultUrl, resultKey })
      }
    } catch (processError) {
      console.error('Error processing video:', processError)
    }

    // Deduct credit
    await deductCredits(user.id, 1)

    // Save conversion record
    const conversionId = await createConversion(user.id, videoUrl, resultUrl)

    await addCreditHistory(user.id, 1, 'spent', 'Old video restoration', String(conversionId))

    return NextResponse.json({ resultUrl })
  } catch (error: any) {
    console.error('Error restoring video:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to restore video' },
      { status: 500 }
    )
  }
}
