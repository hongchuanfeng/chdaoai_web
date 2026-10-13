import { tools, categoryInfo, getToolsByCategory } from '@/lib/tools-catalog'
import type { Metadata } from 'next'

type Language = 'en' | 'zh'
const isZhLang = (lang: string): boolean => lang === 'zh'

const t = {
  en: {
    title: 'All Tools - 80+ AI-Powered Online Tools | ChDaoAI',
    description: 'Browse our complete library of 80+ AI-powered tools for images, videos, audio, PDFs, subtitles, eBooks, QR codes, and more. Free to try.',
    heroTitle: 'All Tools',
    heroSubtitle: 'Browse our complete library of 80+ professional tools. Find the right one for any task in seconds.',
    heroBadge: `${tools.length}+ Tools Available`,
    searchPlaceholder: 'Search tools by name, category, or keyword...',
    categoryLabel: 'All Categories',
    popularLabel: 'Popular',
    aiLabel: 'AI-Powered',
    newLabel: 'New',
    tryButton: 'Try Tool',
    viewAllInCategory: 'View all in this category',
    noResults: 'No tools found matching your search.',
    whyTitle: 'Why Use ChDaoAI Tools?',
    whySubtitle: 'Every tool is built with the same standards: fast, accurate, secure, and easy to use.',
    quickAccessTitle: 'Quick Access',
    quickAccessSubtitle: 'Jump to your favorite category',
    ctaTitle: 'Not Sure Which Tool to Use?',
    ctaSubtitle: 'Browse our comprehensive guides to learn about each tool, or contact us for personalized recommendations.',
    viewGuides: 'View Guides',
    contactUs: 'Contact Us',
    features: [
      { icon: '⚡', title: 'Lightning Fast', desc: 'Most tools complete in under 10 seconds thanks to GPU-accelerated processing.' },
      { icon: '🔒', title: 'Secure & Private', desc: 'End-to-end encryption, automatic file deletion, GDPR compliant.' },
      { icon: '💎', title: 'Professional Quality', desc: 'The same AI models used by Fortune 500 companies.' },
      { icon: '💰', title: 'Free to Start', desc: '100 free credits on signup. No credit card required.' },
      { icon: '🌍', title: '10 Languages', desc: 'Full interface and support in 10 languages.' },
      { icon: '🔄', title: 'Always Updated', desc: 'New tools and improvements shipped every week.' },
    ],
  },
  zh: {
    title: '所有工具 - 80+AI驱动的在线工具 | ChDaoAI',
    description: '浏览我们超过80种AI驱动工具的完整库，涵盖图像、视频、音频、PDF、字幕、电子书、二维码等。免费试用。',
    heroTitle: '所有工具',
    heroSubtitle: '浏览我们超过80种专业工具的完整库。几秒钟内找到适合任何任务的工具。',
    heroBadge: `${tools.length}+ 种工具可用`,
    searchPlaceholder: '按名称、类别或关键字搜索工具...',
    categoryLabel: '所有类别',
    popularLabel: '热门',
    aiLabel: 'AI驱动',
    newLabel: '新',
    tryButton: '试用工具',
    viewAllInCategory: '查看此类别中的所有工具',
    noResults: '未找到与您的搜索匹配的工具。',
    whyTitle: '为什么使用 ChDaoAI 工具？',
    whySubtitle: '每个工具都遵循相同的标准构建：快速、准确、安全且易于使用。',
    quickAccessTitle: '快速访问',
    quickAccessSubtitle: '跳转到您喜欢的类别',
    ctaTitle: '不确定使用哪个工具？',
    ctaSubtitle: '浏览我们的综合指南以了解每个工具，或联系我们获取个性化推荐。',
    viewGuides: '查看指南',
    contactUs: '联系我们',
    features: [
      { icon: '⚡', title: '极快速', desc: '得益于GPU加速处理，大多数工具在10秒内完成。' },
      { icon: '🔒', title: '安全私密', desc: '端到端加密、自动文件删除、符合GDPR。' },
      { icon: '💎', title: '专业品质', desc: '与财富500强公司使用的相同AI模型。' },
      { icon: '💰', title: '免费开始', desc: '注册即送100免费积分，无需信用卡。' },
      { icon: '🌍', title: '10种语言', desc: '10种语言的完整界面和支持。' },
      { icon: '🔄', title: '始终更新', desc: '每周发布新工具和改进。' },
    ],
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  return {
    title: text.title,
    description: text.description,
    keywords: 'all tools, AI tools, online tools, image tools, video tools, audio tools, PDF tools, free tools',
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/tools`,
    },
    openGraph: {
      title: text.title,
      description: text.description,
      type: 'website',
      url: `https://www.chdaoai.com/${lang}/tools`,
    },
  }
}

export default async function ToolsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  const supportedLang = isZh ? 'zh' : 'en'

  // Group tools by category
  const toolsByCategory = Object.keys(categoryInfo).map(catKey => {
    const cat = catKey as keyof typeof categoryInfo
    return {
      key: cat,
      info: categoryInfo[cat],
      tools: getToolsByCategory(cat),
    }
  }).filter(group => group.tools.length > 0)

  // Build ItemList schema for all tools
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ChDaoAI Tools Catalog',
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: isZh ? tool.title.zh : tool.title.en,
      url: `https://www.chdaoai.com/${lang}/${tool.slug}`,
      description: isZh ? tool.shortDescription.zh : tool.shortDescription.en,
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
        <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-4">
              {text.heroBadge}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {text.heroTitle}
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-95">
              {text.heroSubtitle}
            </p>
          </div>
        </section>

        {/* QUICK ACCESS */}
        <section className="py-8 bg-gray-50 border-b border-gray-200 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-center">
              <a
                href="#all"
                className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium"
              >
                {text.categoryLabel}
              </a>
              {toolsByCategory.map(group => (
                <a
                  key={group.key}
                  href={`#${group.key}`}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 rounded-full text-sm font-medium transition"
                >
                  {isZh ? group.info.name.zh : group.info.name.en} ({group.tools.length})
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* TOOLS BY CATEGORY */}
        <div id="all" className="py-12">
          {toolsByCategory.map((group) => (
            <section
              key={group.key}
              id={group.key}
              className="py-12 border-b border-gray-100 last:border-b-0"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="text-5xl">{group.info.icon}</div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                      {isZh ? group.info.name.zh : group.info.name.en}
                    </h2>
                    <p className="text-gray-600 mt-1 max-w-3xl">
                      {isZh ? group.info.description.zh : group.info.description.en}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.tools.map(tool => (
                    <a
                      key={tool.slug}
                      href={`/${lang}/${tool.slug}`}
                      className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition flex-1">
                          {isZh ? tool.title.zh : tool.title.en}
                        </h3>
                        <div className="flex flex-col gap-1 ml-2 flex-shrink-0">
                          {tool.popular && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                              {text.popularLabel}
                            </span>
                          )}
                          {tool.isAI && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                              {text.aiLabel}
                            </span>
                          )}
                          {tool.isNew && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                              {text.newLabel}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
                        {isZh ? tool.shortDescription.zh : tool.shortDescription.en}
                      </p>
                      <span className="text-blue-600 text-sm font-medium group-hover:underline">
                        {text.tryButton} →
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* WHY US */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {text.whyTitle}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {text.whySubtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {text.features.map((f, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="text-4xl mb-3">{f.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
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
                href={`/${lang}/guides`}
                className="inline-block bg-white text-blue-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
              >
                {text.viewGuides} →
              </a>
              <a
                href={`/${lang}/contact`}
                className="inline-block bg-blue-500 border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-400 transition"
              >
                {text.contactUs}
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
