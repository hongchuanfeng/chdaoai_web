import { MetadataRoute } from 'next'
import { tools } from '@/lib/tools-catalog'
import { blogPosts } from '@/lib/blog-data'
import { guides } from '@/lib/guides-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.chdaoai.com'
  const locales = ['en', 'zh', 'ru', 'ar', 'de', 'ja', 'fr', 'es', 'pt', 'ko']

  // Static pages with priorities
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/about', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/tools', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/guides', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/subscribe', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/remove-watermark', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/ai-remove-background', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/image-compress', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/video-to-text', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/pdf-merge', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/pdf-split', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/audio-format-conversion', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/qrcode-generate', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/subtitle-translation', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/ai-text-to-image', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/image-format-conversion', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/audio-to-text', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/privacy-policy', priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/terms-of-service', priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/refund-policy', priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/disclaimer', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/copyright', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/legal-notice', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/intellectual-property', priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  const sitemap: MetadataRoute.Sitemap = []

  // Static pages for all locales
  locales.forEach(locale => {
    const localePrefix = locale === 'en' ? '' : `/${locale}`

    staticPages.forEach(page => {
      sitemap.push({
        url: `${baseUrl}${localePrefix}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      })
    })
  })

  // Tool pages (all 10 locales, only en + zh have rich content, others have basic pages)
  tools.forEach(tool => {
    locales.forEach(locale => {
      const localePrefix = locale === 'en' ? '' : `/${locale}`
      sitemap.push({
        url: `${baseUrl}${localePrefix}/${tool.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: tool.popular ? 0.9 : 0.7,
      })
    })
  })

  // Blog posts (en + zh only - the only languages with full content)
  blogPosts.forEach(post => {
    ;['en', 'zh'].forEach(locale => {
      const localePrefix = locale === 'en' ? '' : `/${locale}`
      sitemap.push({
        url: `${baseUrl}${localePrefix}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: 'monthly',
        priority: post.featured ? 0.9 : 0.7,
      })
    })
  })

  // Guides (en + zh only)
  guides.forEach(guide => {
    ;['en', 'zh'].forEach(locale => {
      const localePrefix = locale === 'en' ? '' : `/${locale}`
      sitemap.push({
        url: `${baseUrl}${localePrefix}/guides/${guide.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    })
  })

  return sitemap
}
