import { NextRequest, NextResponse } from 'next/server'
import { getUserById, deductCredits, addCreditHistory } from '@/lib/mysql'

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    console.log('=== Text to Video API Request ===')
    console.log('Request body:', requestBody)

    const { prompt, userId } = requestBody

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
      prompt: prompt.substring(0, 100) + '...',
      userId
    })

    // 检查用户积分 (文生视频需要2积分)
    const userData = await getUserById(userId)

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (userData.credits < 2) {
      return NextResponse.json(
        { error: 'Insufficient credits. This feature requires 2 credits.' },
        { status: 402 }
      )
    }

    // 调用腾讯云文生视频API
    console.log('Calling Tencent Text to Video API...')
    
    const result = await callTencentTextToVideoAPI(prompt)
    
    if (!result) {
      throw new Error('Text to video processing failed')
    }

    console.log('Processing successful, deducting credits...')
    await deductCredits(userId, 2)
    
    // 记录积分历史
    await addCreditHistory(
      userId,
      2,
      'spent',
      'AI Text to Video generation'
    )

    console.log('Final video URL length:', result.videoUrl ? result.videoUrl.length : 0)

    return NextResponse.json({
      success: true,
      videoUrl: result.videoUrl,
      message: 'Video generated successfully'
    })

  } catch (error) {
    console.error('Text to Video API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function callTencentTextToVideoAPI(prompt: string): Promise<{ videoUrl: string } | null> {
  try {
    // 由于腾讯云暂无公开的文生视频API，这里返回示例视频URL
    // 实际项目中可以接入第三方文生视频API
    const demoVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    
    console.log('Using demo video URL:', demoVideoUrl)
    
    return {
      videoUrl: demoVideoUrl,
    }
  } catch (error) {
    console.error('Error calling text to video API:', error)
    return null
  }
}
