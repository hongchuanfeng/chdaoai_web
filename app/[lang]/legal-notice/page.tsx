import LegalNotice from '@/components/LegalNotice'
import { Metadata } from 'next'

type Language = 'en' | 'zh'
const isZhLang = (lang: string): boolean => lang === 'zh'

const t = {
  en: {
    title: 'Legal Notice | ChDaoAI',
    description: 'Read the legal notice for ChDaoAI. Information about governing law, jurisdiction, and contact information.',
  },
  zh: {
    title: '法律声明 | ChDaoAI',
    description: '阅读 ChDaoAI 的法律声明。有关适用法律、管辖权和联系信息的信息。',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  return {
    title: text.title,
    description: text.description,
    keywords: 'legal notice, governing law, jurisdiction',
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/legal-notice`,
    },
    openGraph: {
      title: text.title,
      description: text.description,
      type: 'website',
      url: `https://www.chdaoai.com/${lang}/legal-notice`,
    },
  }
}

export default function LangLegalNoticePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LegalNotice />
    </div>
  )
}
