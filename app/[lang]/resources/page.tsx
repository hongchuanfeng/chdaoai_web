import type { Metadata } from 'next'
import Link from 'next/link'
import { tools, categoryInfo } from '@/lib/tools-catalog'
import { blogPosts } from '@/lib/blog-data'
import { guides } from '@/lib/guides-data'

type Language = 'en' | 'zh'
const isZhLang = (lang: string): boolean => lang === 'zh'

const t = {
  en: {
    title: 'Resources - Blog, Guides, and Tutorials | ChDaoAI',
    description: 'Browse our complete library of resources: in-depth blog articles, step-by-step guides, and tool documentation to help you master digital content creation.',
    heroTitle: 'Resources & Learning',
    heroSubtitle: 'Everything you need to master our tools and get the most out of your digital workflow.',
    blogTitle: 'Latest from the Blog',
    blogSubtitle: 'Insights, tutorials, and product updates from our team',
    guidesTitle: 'In-Depth Guides',
    guidesSubtitle: 'Step-by-step tutorials for beginners and advanced users',
    toolsTitle: 'All Tools',
    toolsSubtitle: 'Browse our complete catalog of 80+ AI-powered tools',
    readArticle: 'Read Article',
    readGuide: 'Read Guide',
    exploreTool: 'Explore Tool',
  },
  zh: {
    title: '资源 - 博客、指南和教程 | ChDaoAI',
    description: '浏览我们的完整资源库：深入的博客文章、分步指南和工具文档，帮助您掌握数字内容创建。',
    heroTitle: '资源与学习',
    heroSubtitle: '掌握我们的工具并充分利用您的数字工作流所需的一切。',
    blogTitle: '最新博客',
    blogSubtitle: '来自我们团队的见解、教程和产品更新',
    guidesTitle: '深入指南',
    guidesSubtitle: '面向初学者和高级用户的分步教程',
    toolsTitle: '所有工具',
    toolsSubtitle: '浏览我们80多种AI驱动工具的完整目录',
    readArticle: '阅读文章',
    readGuide: '阅读指南',
    exploreTool: '探索工具',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  return {
    title: text.title,
    description: text.description,
    keywords: 'resources, blog, guides, tutorials, learning, ChDaoAI',
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/resources`,
    },
    openGraph: {
      title: text.title,
      description: text.description,
      type: 'website',
      url: `https://www.chdaoai.com/${lang}/resources`,
    },
  }
}

export default async function ResourcesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en

  const recentPosts = [...blogPosts].sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  ).slice(0, 6)

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="bg-gradient-to-br from-purple-600 via-blue-700 to-indigo-800 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-4">
            📚 {blogPosts.length + guides.length} Resources Available
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {text.heroTitle}
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-95">
            {text.heroSubtitle}
          </p>
        </div>
      </section>

      {/* CATEGORIES QUICK ACCESS */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="#blog" className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">
              📝 {text.blogTitle}
            </a>
            <a href="#guides" className="px-5 py-2 bg-white border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 rounded-full text-sm font-medium transition">
              📖 {text.guidesTitle}
            </a>
            <a href="#tools" className="px-5 py-2 bg-white border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 rounded-full text-sm font-medium transition">
              🛠️ {text.toolsTitle}
            </a>
          </div>
        </div>
      </section>

      {/* BLOG SECTION */}
      <section id="blog" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {text.blogTitle}
              </h2>
              <p className="text-lg text-gray-600">
                {text.blogSubtitle}
              </p>
            </div>
            <Link href={`/${lang}/blog`} className="mt-4 md:mt-0 inline-block text-blue-600 font-semibold hover:text-blue-700">
              {isZh ? '所有文章' : 'All articles'} →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map(post => (
              <Link
                key={post.slug}
                href={`/${lang}/blog/${post.slug}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition group border border-gray-100"
              >
                <div className="h-40 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-5xl">📰</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                    <span>{new Date(post.publishedAt).toLocaleDateString(isZh ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span>·</span>
                    <span>{isZh ? post.readingTime.zh : post.readingTime.en}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
                    {isZh ? post.title.zh : post.title.en}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {isZh ? post.description.zh : post.description.en}
                  </p>
                  <span className="text-blue-600 text-sm font-medium">
                    {text.readArticle} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* GUIDES SECTION */}
      <section id="guides" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {text.guidesTitle}
              </h2>
              <p className="text-lg text-gray-600">
                {text.guidesSubtitle}
              </p>
            </div>
            <Link href={`/${lang}/guides`} className="mt-4 md:mt-0 inline-block text-blue-600 font-semibold hover:text-blue-700">
              {isZh ? '所有指南' : 'All guides'} →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.slice(0, 6).map(guide => (
              <Link
                key={guide.slug}
                href={`/${lang}/guides/${guide.slug}`}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {isZh ? guide.difficulty.zh : guide.difficulty.en}
                  </span>
                  <span className="text-xs text-gray-500">
                    {isZh ? guide.readingTime.zh : guide.readingTime.en}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
                  {isZh ? guide.title.zh : guide.title.en}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {isZh ? guide.description.zh : guide.description.en}
                </p>
                <span className="text-blue-600 text-sm font-medium mt-3 inline-block">
                  {text.readGuide} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS BY CATEGORY */}
      <section id="tools" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {text.toolsTitle}
            </h2>
            <p className="text-lg text-gray-600">
              {text.toolsSubtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(categoryInfo).map(([key, info]) => {
              const toolCount = tools.filter(t => t.category === key).length
              return (
                <Link
                  key={key}
                  href={`/${lang}/tools#${key}`}
                  className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition group"
                >
                  <div className="text-4xl mb-3">{info.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                    {isZh ? info.name.zh : info.name.en}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-2 line-clamp-2">
                    {isZh ? info.description.zh : info.description.en}
                  </p>
                  <span className="text-blue-600 text-sm font-medium">
                    {toolCount} tools →
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
