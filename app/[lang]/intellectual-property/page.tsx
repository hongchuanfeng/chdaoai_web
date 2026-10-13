import IntellectualProperty from '@/components/IntellectualProperty'
import { Metadata } from 'next'

type Language = 'en' | 'zh'
const isZhLang = (lang: string): boolean => lang === 'zh'

const t = {
  en: {
    title: 'Intellectual Property Policy | ChDaoAI',
    description: 'Read our intellectual property policy. Information about trademarks, patents, copyrights, and reporting IP violations.',
  },
  zh: {
    title: '知识产权政策 | ChDaoAI',
    description: '阅读我们的知识产权政策。有关商标、专利、版权和举报知识产权侵权的相关信息。',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  return {
    title: text.title,
    description: text.description,
    keywords: 'intellectual property, trademark, patent, copyright, IP violations',
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/intellectual-property`,
    },
    openGraph: {
      title: text.title,
      description: text.description,
      type: 'website',
      url: `https://www.chdaoai.com/${lang}/intellectual-property`,
    },
  }
}

export default function LangIntellectualPropertyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <IntellectualProperty />
    </div>
  )
}
