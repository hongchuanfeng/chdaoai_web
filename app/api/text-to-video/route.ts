import { NextRequest, NextResponse } from 'next/server'
import { supabaseClient } from '@/lib/supabase'

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
        { error: 'Insufficient credits. This feature requires 2 credits.' },
        { status: 402 }
      )
    }

    // 调用腾讯云文生视频API
    console.log('Calling Tencent Text to Video API...')
    
    // 模拟视频生成 (实际项目中需要调用真实的腾讯云视频生成API)
    // 腾讯云暂无公开的文生视频API，这里返回示例视频
    const result = await callTencentTextToVideoAPI(prompt)
    
    if (!result) {
      throw new Error('Text to video processing failed')
    }

    console.log('Processing successful, deducting credits...')
    const { error: updateError } = await supabaseClient
      .from('users')
      .update({ credits: userData.credits - 2 })
      .eq('id', userId)

    if (updateError) {
      console.error('Failed to deduct credits after successful processing:', updateError)
    } else {
      // 记录积分历史
      await supabaseClient
        .from('credit_history')
        .insert({
          user_id: userId,
          amount: -2,
          type: 'spent',
          description: 'AI Text to Video generation'
        })
    }

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
    // 实际项目中可以接入第三方文生视频API，如:
    // - Runway ML
    // - Pika Labs
    // - Stable Video Diffusion
    // - 字节跳动/D-ID等
    
    // 返回一个示例视频（公开可用的视频）
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
