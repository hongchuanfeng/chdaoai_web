import type { Metadata } from 'next'
import { guides, guideCategories } from '@/lib/guides-data'

type Language = 'en' | 'zh'
const isZhLang = (lang: string): boolean => lang === 'zh'

const t = {
  en: {
    title: 'Guides & Tutorials - Learn to Use ChDaoAI Tools | ChDaoAI',
    description: 'Comprehensive guides, tutorials, and best practices for all ChDaoAI tools. From beginner basics to advanced workflows.',
    heroTitle: 'Guides & Tutorials',
    heroSubtitle: 'In-depth tutorials and best practices to help you master every ChDaoAI tool. From beginner basics to advanced workflows.',
    allLabel: 'All',
    readMore: 'Read Guide',
    minutesRead: 'min read',
    noResults: 'No guides found in this category.',
    ctaTitle: 'Want to Master Our Tools?',
    ctaSubtitle: 'Our guides cover everything from quick start to professional workflows. Bookmark this page and return whenever you need a refresher.',
    viewBlog: 'View Blog',
    startFree: 'Start Free',
  },
  zh: {
    title: '指南和教程 - 学习使用 ChDaoAI 工具 | ChDaoAI',
    description: '所有 ChDaoAI 工具的综合指南、教程和最佳实践。从初学者基础到高级工作流。',
    heroTitle: '指南和教程',
    heroSubtitle: '深入的教程和最佳实践，帮助您掌握每个 ChDaoAI 工具。从初学者基础到高级工作流。',
    allLabel: '全部',
    readMore: '阅读指南',
    minutesRead: '分钟阅读',
    noResults: '此类别中未找到指南。',
    ctaTitle: '想掌握我们的工具吗？',
    ctaSubtitle: '我们的指南涵盖从快速入门到专业工作流的所有内容。收藏此页面，在需要复习时随时返回。',
    viewBlog: '查看博客',
    startFree: '免费开始',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  return {
    title: text.title,
    description: text.description,
    keywords: 'guides, tutorials, how-to, ChDaoAI, best practices, tool guides, beginner guide, advanced guide',
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/guides`,
    },
    openGraph: {
      title: text.title,
      description: text.description,
      type: 'website',
      url: `https://www.chdaoai.com/${lang}/guides`,
    },
  }
}

const guideSeoText = {
  en: {
    sectionTitle: 'Learn ChDaoAI Inside and Out',
    sectionDesc: 'Our guides are written by the team that builds the tools. They cover not just how to click buttons, but when to use which tool, how to combine tools for complex workflows, and the best practices that professional users follow.',
    longFormTitle: 'What You Will Find in Our Guides',
    longFormDesc: 'Every ChDaoAI guide is structured to be immediately useful, even if you only have five minutes. We start with a clear summary of what you will learn, then walk through each step with screenshots and examples where helpful. Most guides conclude with troubleshooting tips, advanced usage notes, and links to related guides that take your skills further.',
    longFormPoints: [
      'Step-by-step tutorials with annotated screenshots',
      'Best practices used by professional creators',
      'Comparison of different approaches so you can choose what works for you',
      'Troubleshooting tips for common issues',
      'Advanced tips and shortcuts',
      'Related tool recommendations for end-to-end workflows',
    ],
  },
  zh: {
    sectionTitle: '从内到外学习 ChDaoAI',
    sectionDesc: '我们的指南由构建工具的团队编写。它们不仅涵盖如何点击按钮，还涵盖何时使用哪个工具、如何组合工具以完成复杂工作流，以及专业用户遵循的最佳实践。',
    longFormTitle: '在我们的指南中您将找到什么',
    longFormDesc: '每个 ChDaoAI 指南的结构都旨在即使您只有五分钟也能立即使用。我们从清晰的学习内容摘要开始，然后通过截图和示例逐步引导您完成每个步骤。大多数指南以故障排除提示、高级用法说明和指向相关指南的链接结尾，这些指南将进一步提升您的技能。',
    longFormPoints: [
      '带注释截图的分步教程',
      '专业创作者使用的最佳实践',
      '不同方法的比较，以便您选择适合您的方法',
      '常见问题的故障排除提示',
      '高级提示和快捷方式',
      '用于端到端工作流的相关工具推荐',
    ],
  },
}

export default async function GuidesListPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  const longText = isZh ? guideSeoText.zh : guideSeoText.en

  // Build ItemList schema
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ChDaoAI Guides & Tutorials',
    numberOfItems: guides.length,
    itemListElement: guides.map((guide, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: isZh ? guide.title.zh : guide.title.en,
      url: `https://www.chdaoai.com/${lang}/guides/${guide.slug}`,
      description: isZh ? guide.description.zh : guide.description.en,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="min-h-screen bg-white">
        {/* HERO */}
        <section className="bg-gradient-to-br from-indigo-600 via-blue-700 to-purple-800 text-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-4">
              📚 {guides.length} Guides Available
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {text.heroTitle}
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-95">
              {text.heroSubtitle}
            </p>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="py-6 bg-white border-b border-gray-200 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {guideCategories.map(cat => (
                <a
                  key={cat.id}
                  href={cat.id === 'all' ? '#all' : `#${cat.id}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    cat.id === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isZh ? cat.name.zh : cat.name.en}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* GUIDES BY CATEGORY */}
        {guideCategories.filter(c => c.id !== 'all').map(cat => {
          const catGuides = guides.filter(g => g.category === cat.id)
          if (catGuides.length === 0) return null
          return (
            <section
              key={cat.id}
              id={cat.id}
              className="py-12 border-b border-gray-100 last:border-b-0"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {isZh ? cat.name.zh : cat.name.en}
                  </h2>
                  <p className="text-gray-600">
                    {catGuides.length} {isZh ? '篇指南' : 'guides'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catGuides.map(guide => (
                    <a
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
                      <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-3">
                        {isZh ? guide.description.zh : guide.description.en}
                      </p>
                      <span className="text-blue-600 text-sm font-medium group-hover:underline">
                        {text.readMore} →
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          )
        })}

        {/* SEO-CRITICAL LONG-FORM CONTENT */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {longText.sectionTitle}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              {longText.sectionDesc}
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
              {longText.longFormTitle}
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              {longText.longFormDesc}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              {longText.longFormPoints.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {text.ctaTitle}
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-95 max-w-2xl mx-auto">
              {text.ctaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`/${lang}/blog`}
                className="inline-block bg-white text-blue-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
              >
                {text.viewBlog} →
              </a>
              <a
                href={`/${lang}/auth/register`}
                className="inline-block bg-blue-500 border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-400 transition"
              >
                {text.startFree}
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
