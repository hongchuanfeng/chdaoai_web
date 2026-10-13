import RemoveWatermarkInline from '@/components/RemoveWatermarkInline'
import ImageToolInfo from '@/components/ImageToolInfo'
import CTA from '@/components/CTA'
import { Metadata } from 'next'

type Language = 'en' | 'zh'
const isZhLang = (lang: string): boolean => lang === 'zh'

const t = {
  en: {
    title: 'Remove Watermark from Photo - Free AI Watermark Remover | ChDaoAI',
    description: 'Remove watermarks, logos, and text overlays from photos instantly with our free AI-powered watermark remover. Clean, natural-looking results in seconds. No Photoshop needed.',
  },
  zh: {
    title: '图片去水印 - 免费AI水印去除工具 | ChDaoAI',
    description: '使用我们的免费AI去水印工具，即时去除照片中的水印、Logo和文字叠加。几秒钟内获得干净自然的效果。无需Photoshop。',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  return {
    title: text.title,
    description: text.description,
    keywords: 'remove watermark, watermark remover, logo remover, AI watermark removal, free watermark remover, remove text from photo',
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/remove-watermark`,
    },
    openGraph: {
      title: text.title,
      description: text.description,
      type: 'website',
      url: `https://www.chdaoai.com/${lang}/remove-watermark`,
    },
  }
}

export default function LangRemoveWatermarkPage() {
  const exampleImages = [
    '/image/watermark/remove/1.jpg',
    '/image/watermark/remove/2.jpg',
    '/image/watermark/remove/3.jpg',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <RemoveWatermarkInline />
      <ImageToolInfo toolKey="image_watermark_removal" exampleImages={exampleImages} />
      <CTA />
    </div>
  )
}
