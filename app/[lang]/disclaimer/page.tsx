import Disclaimer from '@/components/Disclaimer'
import { Metadata } from 'next'

type Language = 'en' | 'zh'
const isZhLang = (lang: string): boolean => lang === 'zh'

const t = {
  en: {
    title: 'Disclaimer | ChDaoAI',
    description: 'Read the disclaimer for using ChDaoAI tools. Important information about service availability, legal use, and liability.',
  },
  zh: {
    title: '免责声明 | ChDaoAI',
    description: '阅读使用 ChDaoAI 工具的免责声明。有关服务可用性、合法使用和责任的重要信息。',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  return {
    title: text.title,
    description: text.description,
    keywords: 'disclaimer, legal use, liability, terms',
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/disclaimer`,
    },
    openGraph: {
      title: text.title,
      description: text.description,
      type: 'website',
      url: `https://www.chdaoai.com/${lang}/disclaimer`,
    },
  }
}

export default function LangDisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Disclaimer />
    </div>
  )
}
