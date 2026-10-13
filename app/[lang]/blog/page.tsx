import type { Metadata } from 'next'
import Link from 'next/link'
import { blogPosts, blogCategories } from '@/lib/blog-data'
import { pickLocalized, pickLocalizedArray, resolveLang, SUPPORTED_LANGS } from '@/lib/i18n'

// `Language` is now provided by lib/i18n.ts
type Language = (typeof SUPPORTED_LANGS)[number]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const supportedLang: Language = resolveLang(lang)

  const title = supportedLang === 'zh'
    ? '博客 - AI 工具、图像处理与数字创作的专业见解'
    : 'Blog - Expert Insights on AI Tools, Image Processing, and Digital Creation'

  const description = supportedLang === 'zh'
    ? '探索关于 AI 工具、图像处理、视频编辑、PDF 优化等领域的深度文章、教程和专家见解。提升您的数字技能。'
    : 'Explore in-depth articles, tutorials, and expert insights on AI tools, image processing, video editing, PDF optimization, and more. Improve your digital skills.'

  return {
    title,
    description,
    keywords: 'AI tools blog, image processing tutorials, video editing, PDF tips, technology insights, digital creation',
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.chdaoai.com/${lang}/blog`,
    },
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/blog`,
    },
  }
}

const t = {
  en: {
    heroTitle: 'ChDaoAI Blog',
    heroSubtitle: 'Expert insights, tutorials, and in-depth guides on AI tools, image processing, video editing, and digital creation',
    heroDescription: 'Discover practical knowledge that helps you make better decisions about your digital content.',
    allArticles: 'All Articles',
    featured: 'Featured',
    readMore: 'Read Article',
    readingTime: 'min read',
    publishedOn: 'Published on',
    by: 'by',
    articlesFound: 'articles found',
    newsletterTitle: 'Stay Updated',
    newsletterDescription: 'Get the latest articles, tutorials, and product updates delivered to your inbox. No spam, unsubscribe anytime.',
    newsletterPlaceholder: 'Your email address',
    newsletterButton: 'Subscribe',
    exploreTitle: 'Explore by Category',
    exploreDescription: 'Find articles tailored to your specific interests and needs',
  },
  zh: {
    heroTitle: 'ChDaoAI 博客',
    heroSubtitle: '关于 AI 工具、图像处理、视频编辑和数字创作的专家见解、教程和深度指南',
    heroDescription: '发现实用的知识，帮助您对数字内容做出更好的决策。',
    allArticles: '所有文章',
    featured: '精选',
    readMore: '阅读全文',
    readingTime: '分钟阅读',
    publishedOn: '发布于',
    by: '作者',
    articlesFound: '篇文章',
    newsletterTitle: '保持更新',
    newsletterDescription: '获取最新的文章、教程和产品更新，直接发送到您的收件箱。无垃圾邮件，随时取消订阅。',
    newsletterPlaceholder: '您的电子邮件地址',
    newsletterButton: '订阅',
    exploreTitle: '按类别浏览',
    exploreDescription: '找到针对您特定兴趣和需求定制的文章',
  },
}

const articleListSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'ChDaoAI Blog',
  description: 'Expert insights, tutorials, and in-depth guides on AI tools and digital creation',
  url: 'https://www.chdaoai.com/en/blog',
  publisher: {
    '@type': 'Organization',
    name: 'ChDaoAI',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.chdaoai.com/icon.svg',
    },
  },
  blogPost: blogPosts.slice(0, 10).map(post => ({
    '@type': 'BlogPosting',
    headline: post.title.en,
    description: post.description.en,
    url: `https://www.chdaoai.com/en/blog/${post.slug}`,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
  })),
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const supportedLang: Language = resolveLang(lang)
  const text = (t as any)[supportedLang] || t.en

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleListSchema) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {text.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto opacity-95">
              {text.heroSubtitle}
            </p>
            <p className="text-base md:text-lg max-w-2xl mx-auto opacity-85">
              {text.heroDescription}
            </p>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm opacity-90">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                {blogPosts.length} {text.articlesFound}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Updated Weekly
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                Expert Authors
              </span>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {blogCategories.map(cat => (
                <span
                  key={cat.id}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    cat.id === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } cursor-pointer transition`}
                >
                  {pickLocalized(cat.name, supportedLang)}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {text.featured} {supportedLang === 'zh' ? '文章' : 'Articles'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {blogPosts.filter(p => p.featured).slice(0, 3).map(post => (
                <article
                  key={post.slug}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition group"
                >
                  <div className="h-48 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-center p-6">
                      <div className="text-5xl mb-2">📚</div>
                      <span className="text-xs uppercase tracking-wider opacity-90">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {text.featured}
                      </span>
                      <span className="text-xs text-gray-500">{pickLocalized(post.readingTime, supportedLang)}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition line-clamp-2">
                      {pickLocalized(post.title, supportedLang)}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                      {pickLocalized(post.description, supportedLang)}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{post.author}</span>
                      <Link
                        href={`/${supportedLang}/blog/${post.slug}`}
                        className="text-blue-600 font-medium hover:text-blue-700"
                      >
                        {text.readMore} →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* All Articles */}
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {text.allArticles}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map(post => (
                <article
                  key={post.slug}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition group"
                >
                  <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="text-gray-600 text-center p-4">
                      <div className="text-4xl mb-2">
                        {post.category === 'ai' && '🤖'}
                        {post.category === 'tutorial' && '📖'}
                        {post.category === 'image' && '🖼️'}
                        {post.category === 'video' && '🎬'}
                        {post.category === 'audio' && '🎵'}
                        {post.category === 'pdf' && '📄'}
                        {post.category === 'news' && '📰'}
                      </div>
                      <span className="text-xs uppercase tracking-wider">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-500">
                        {new Date(post.publishedAt).toLocaleDateString(supportedLang === 'zh' ? 'zh-CN' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-500">{pickLocalized(post.readingTime, supportedLang)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
                      {pickLocalized(post.title, supportedLang)}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                      {pickLocalized(post.description, supportedLang)}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {pickLocalizedArray(post.tags, supportedLang).slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                      <span className="text-gray-500 text-xs">{post.author}</span>
                      <Link
                        href={`/${supportedLang}/blog/${post.slug}`}
                        className="text-blue-600 font-medium hover:text-blue-700 text-sm"
                      >
                        {text.readMore} →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {text.newsletterTitle}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {text.newsletterDescription}
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder={text.newsletterPlaceholder}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <button
                type="submit"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                {text.newsletterButton}
              </button>
            </form>
            <p className="text-xs opacity-75 mt-4">
              {supportedLang === 'zh' ? '我们尊重您的隐私。' : 'We respect your privacy.'}
            </p>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {text.exploreTitle}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {text.exploreDescription}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {blogCategories.filter(c => c.id !== 'all').map(cat => {
                const count = blogPosts.filter(p => p.category === cat.id).length
                return (
                  <div
                    key={cat.id}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl text-center hover:shadow-lg transition"
                  >
                    <div className="text-3xl mb-2">
                      {cat.id === 'ai' && '🤖'}
                      {cat.id === 'image' && '🖼️'}
                      {cat.id === 'video' && '🎬'}
                      {cat.id === 'pdf' && '📄'}
                      {cat.id === 'tutorial' && '📖'}
                      {cat.id === 'news' && '📰'}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                      {pickLocalized(cat.name, supportedLang)}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {count} {supportedLang === 'zh' ? '篇' : 'articles'}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
