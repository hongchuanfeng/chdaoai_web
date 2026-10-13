import About from '@/components/About'
import { Metadata } from 'next'

type Language = 'en' | 'zh'
const isZhLang = (lang: string): boolean => lang === 'zh'

const t = {
  en: {
    title: 'About Us - Our Mission, Team, and Story | ChDaoAI',
    description: 'Learn about ChDaoAI: our mission to democratize AI tools, our global team, our values, and the story behind the platform serving 500,000+ users in 150+ countries.',
  },
  zh: {
    title: '关于我们 - 我们的使命、团队和故事 | ChDaoAI',
    description: '了解 ChDaoAI：我们对AI工具民主化的使命、我们的全球团队、我们的价值观以及服务150多个国家50多万用户的平台背后的故事。',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  return {
    title: text.title,
    description: text.description,
    keywords: 'about ChDaoAI, AI tools company, our team, our mission, company story',
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/about`,
    },
    openGraph: {
      title: text.title,
      description: text.description,
      type: 'website',
      url: `https://www.chdaoai.com/${lang}/about`,
    },
  }
}

export default function LangAboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <About />
    </div>
  )
}
