import PrivacyPolicy from '@/components/PrivacyPolicy'
import { Metadata } from 'next'

type Language = 'en' | 'zh'
const isZhLang = (lang: string): boolean => lang === 'zh'

const t = {
  en: {
    title: 'Privacy Policy | ChDaoAI',
    description: 'Learn how ChDaoAI collects, uses, and protects your personal data. We are committed to transparency and your privacy rights.',
  },
  zh: {
    title: '隐私政策 | ChDaoAI',
    description: '了解 ChDaoAI 如何收集、使用和保护您的个人数据。我们致力于透明和您的隐私权。',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  return {
    title: text.title,
    description: text.description,
    keywords: 'privacy policy, data protection, GDPR, privacy',
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/privacy-policy`,
    },
    openGraph: {
      title: text.title,
      description: text.description,
      type: 'website',
      url: `https://www.chdaoai.com/${lang}/privacy-policy`,
    },
  }
}

export default function LangPrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PrivacyPolicy />
    </div>
  )
}
