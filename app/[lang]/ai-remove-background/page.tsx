import { Metadata } from 'next'
import RemoveBackground from '@/components/RemoveBackground'
import CTA from '@/components/CTA'

type Language = 'en' | 'zh'
const isZhLang = (lang: string): boolean => lang === 'zh'

const t = {
  en: {
    title: 'AI Background Remover - Remove Image Background Free | ChDaoAI',
    description: 'Remove image backgrounds automatically with AI. Free background remover for product photos, portraits, and graphics. Pixel-perfect cutouts in seconds.',
  },
  zh: {
    title: 'AI抠图 - 免费图片背景移除工具 | ChDaoAI',
    description: '使用AI自动移除图片背景。免费背景移除工具，适用于产品照片、人像和图形。几秒钟内实现像素级完美切割。',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  return {
    title: text.title,
    description: text.description,
    keywords: 'remove background, background remover, AI cutout, transparent PNG, free background removal',
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/ai-remove-background`,
    },
    openGraph: {
      title: text.title,
      description: text.description,
      type: 'website',
      url: `https://www.chdaoai.com/${lang}/ai-remove-background`,
    },
  }
}

export default function LangRemoveBackgroundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <RemoveBackground />
      <CTA />
    </div>
  )
}
