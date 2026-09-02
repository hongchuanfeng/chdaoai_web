import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.chdaoai.com'
  const locales = ['en', 'zh', 'ru', 'ar', 'de', 'ja', 'fr', 'es', 'pt', 'ko']
  const routes = [
    '',
    '/about',
    '/contact',
    '/subscribe',
    '/remove-watermark',
    '/ai-age-change',
    '/gender-swapper',
    '/ai-face-beautify',
    '/video-watermark-removal',
    '/video-to-text',
    '/video-to-speech',
    '/old-video-restoration',
    '/audio-clip-merge',
    '/audio-format-conversion',
    '/vocal-separation',
    '/audio-to-text',
    '/audio-to-subtitles',
    '/audio-repair',
    '/text-to-subtitles',
    '/subtitles-to-text',
    '/subtitle-format-conversion',
    '/subtitle-translation',
    '/subtitle-merge',
    '/pdf-merge',
    '/pdf-split',
    '/pdf-deduplicate',
    '/pdf-convert',
    '/pdf-to-audio',
    '/pdf-to-text',
    '/pdf-to-subtitles',
    '/pdf-translate',
    '/csv-merge',
    '/csv-split',
    '/csv-deduplicate',
    '/ebook-merge',
    '/ebook-watermark-removal',
    '/ebook-to-speech',
    '/ebook-subtitles',
    '/ebook-format-conversion',
    '/privacy-policy',
    '/terms-of-service',
    '/refund-policy',
    '/disclaimer',
    '/copyright',
    '/legal-notice',
    '/intellectual-property',
    '/profile'
  ]

  const sitemap: MetadataRoute.Sitemap = []

  // 为每种语言生成所有路由
  locales.forEach(locale => {
    const localePrefix = locale === 'en' ? '' : `/${locale}`

    routes.forEach(route => {
      const url = `${baseUrl}${localePrefix}${route}`

      // 设置优先级和更新频率
      let priority = 0.5
      let changeFrequency: 'yearly' | 'monthly' | 'weekly' | 'daily' = 'yearly'

      if (route === '') {
        priority = 1
        changeFrequency = 'daily'
      } else if (route === '/remove-watermark') {
        priority = 1
        changeFrequency = 'daily'
      } else if (route === '/subscribe') {
        priority = 0.9
        changeFrequency = 'weekly'
      } else if (['/about', '/contact'].includes(route)) {
        priority = 0.8
        changeFrequency = 'monthly'
      }

      sitemap.push({
        url,
        lastModified: new Date(),
        changeFrequency,
        priority,
      })
    })
  })

  return sitemap
}