import RefundPolicy from '@/components/RefundPolicy'
import { Metadata } from 'next'

type Language = 'en' | 'zh'
const isZhLang = (lang: string): boolean => lang === 'zh'

const t = {
  en: {
    title: 'Refund Policy - 7-Day Money-Back Guarantee | ChDaoAI',
    description: 'Read our refund policy. We offer a 7-day money-back guarantee on all subscription plans. No questions asked.',
  },
  zh: {
    title: '退款政策 - 7天无理由退款保证 | ChDaoAI',
    description: '阅读我们的退款政策。我们为所有订阅计划提供7天无理由退款保证。',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  return {
    title: text.title,
    description: text.description,
    keywords: 'refund policy, money back guarantee, subscription refund',
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/refund-policy`,
    },
    openGraph: {
      title: text.title,
      description: text.description,
      type: 'website',
      url: `https://www.chdaoai.com/${lang}/refund-policy`,
    },
  }
}

export default function LangRefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <RefundPolicy />
    </div>
  )
}
