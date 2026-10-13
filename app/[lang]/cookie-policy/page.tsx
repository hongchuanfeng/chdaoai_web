import CookiePolicy from '@/components/CookiePolicy'
import { Metadata } from 'next'

type Language = 'en' | 'zh'
const isZhLang = (lang: string): boolean => lang === 'zh'

const t = {
  en: {
    title: 'Cookie Policy | ChDaoAI',
    description: 'Learn how ChDaoAI uses cookies and similar technologies to provide and improve our services.',
  },
  zh: {
    title: 'Cookie 政策 | ChDaoAI',
    description: '了解 ChDaoAI 如何使用 Cookie 和类似技术来提供和改进我们的服务。',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  return {
    title: text.title,
    description: text.description,
    keywords: 'cookie policy, cookies, GDPR, privacy',
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/cookie-policy`,
    },
    openGraph: {
      title: text.title,
      description: text.description,
      type: 'website',
      url: `https://www.chdaoai.com/${lang}/cookie-policy`,
    },
  }
}

export default function LangCookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CookiePolicy />
    </div>
  )
}
