import { NextRequest, NextResponse } from 'next/server'
import COS from 'cos-nodejs-sdk-v5'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const secretId = process.env.TENCENT_SECRET_ID
    const secretKey = process.env.TENCENT_SECRET_KEY
    const region = process.env.TENCENT_REGION || 'ap-shanghai'
    const bucket = process.env.TENCENT_COS_BUCKET
    const uploadDir = process.env.TENCENT_COS_UPLOAD_DIR || '/uploads/'

    if (!secretId || !secretKey || !bucket) {
      return NextResponse.json({ error: 'Tencent Cloud COS not configured' }, { status: 500 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
    const key = `${uploadDir}${fileName}`

    const cos = new COS({
      SecretId: secretId,
      SecretKey: secretKey,
    })

    const result = await new Promise<{ Location: string }>((resolve, reject) => {
      cos.putObject(
        {
          Bucket: bucket,
          Region: region,
          Key: key,
          Body: buffer,
          ContentLength: buffer.length,
        },
        (err, data) => {
          if (err) reject(err)
          else resolve(data as any)
        }
      )
    })

    const cdnDomain = `https://${bucket}.cos.${region}.myqcloud.com`
    const url = `${cdnDomain}${key}`

    return NextResponse.json({ url, fileName })
  } catch (error: any) {
    console.error('Image hosting upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
