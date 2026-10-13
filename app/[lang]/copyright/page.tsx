import Copyright from '@/components/Copyright'
import { Metadata } from 'next'

type Language = 'en' | 'zh'
const isZhLang = (lang: string): boolean => lang === 'zh'

const t = {
  en: {
    title: 'Copyright Notice | ChDaoAI',
    description: 'Read our copyright notice. Information about content ownership, intellectual property, and DMCA procedures.',
  },
  zh: {
    title: '版权声明 | ChDaoAI',
    description: '阅读我们的版权声明。有关内容所有权、知识产权和DMCA程序的信息。',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  return {
    title: text.title,
    description: text.description,
    keywords: 'copyright, intellectual property, DMCA, content ownership',
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/copyright`,
    },
    openGraph: {
      title: text.title,
      description: text.description,
      type: 'website',
      url: `https://www.chdaoai.com/${lang}/copyright`,
    },
  }
}

export default function LangCopyrightPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Copyright />
    </div>
  )
}
