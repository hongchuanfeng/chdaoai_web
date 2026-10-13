import TermsOfService from '@/components/TermsOfService'
import { Metadata } from 'next'

type Language = 'en' | 'zh'
const isZhLang = (lang: string): boolean => lang === 'zh'

const t = {
  en: {
    title: 'Terms of Service | ChDaoAI',
    description: 'Read the terms and conditions for using ChDaoAI tools and services. By using our platform, you agree to these terms.',
  },
  zh: {
    title: '服务条款 | ChDaoAI',
    description: '阅读使用 ChDaoAI 工具和服务的条款和条件。使用我们的平台即表示您同意这些条款。',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  return {
    title: text.title,
    description: text.description,
    keywords: 'terms of service, terms and conditions, user agreement',
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/terms-of-service`,
    },
    openGraph: {
      title: text.title,
      description: text.description,
      type: 'website',
      url: `https://www.chdaoai.com/${lang}/terms-of-service`,
    },
  }
}

export default function LangTermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TermsOfService />
    </div>
  )
}
