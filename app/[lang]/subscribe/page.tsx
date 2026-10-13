import Subscribe from '@/components/Subscribe'
import { Metadata } from 'next'

type Language = 'en' | 'zh'
const isZhLang = (lang: string): boolean => lang === 'zh'

const t = {
  en: {
    title: 'Pricing - Simple, Transparent Plans | ChDaoAI',
    description: 'Choose the plan that fits your needs. Free tier with 100 credits, plus Basic, Standard, and Premium plans for individuals, teams, and businesses.',
  },
  zh: {
    title: '定价 - 简单透明的订阅计划 | ChDaoAI',
    description: '选择适合您需求的计划。免费层提供100积分，以及面向个人、团队和企业的基础、标准、高级计划。',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  return {
    title: text.title,
    description: text.description,
    keywords: 'pricing, subscription plans, AI tools pricing, free credits',
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/subscribe`,
    },
    openGraph: {
      title: text.title,
      description: text.description,
      type: 'website',
      url: `https://www.chdaoai.com/${lang}/subscribe`,
    },
  }
}

export default function LangSubscribePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Subscribe />
    </div>
  )
}
