import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blogPosts, getBlogPostBySlug, getRelatedPosts } from '@/lib/blog-data'
import { pickLocalized, pickLocalizedArray, resolveLang, SUPPORTED_LANGS } from '@/lib/i18n'

// `Language` is now provided by lib/i18n.ts
type Language = (typeof SUPPORTED_LANGS)[number]

export async function generateStaticParams() {
  return blogPosts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const post = getBlogPostBySlug(slug)
  if (!post) return {}

  const supportedLang: Language = resolveLang(lang)
  const title = pickLocalized(post.title, supportedLang)
  const description = pickLocalized(post.description, supportedLang)
  const postTags = pickLocalizedArray(post.tags, supportedLang)

  return {
    title: `${title} | ChDaoAI Blog`,
    description,
    keywords: postTags.join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.chdaoai.com/${lang}/blog/${slug}`,
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: postTags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/blog/${slug}`,
    },
  }
}

const t = {
  en: {
    backToBlog: '← Back to Blog',
    relatedArticles: 'Related Articles',
    publishedOn: 'Published on',
    by: 'by',
    minRead: 'min read',
    tags: 'Tags',
    tableOfContents: 'Table of Contents',
    shareArticle: 'Share this article',
    aboutAuthor: 'About the Author',
    authorBio: 'The ChDaoAI team consists of passionate engineers, designers, and content creators who are dedicated to making powerful AI tools accessible to everyone.',
    moreFromCategory: 'More from this category',
    exploreTools: 'Explore Our Tools',
    toolsDescription: 'Try the AI-powered tools mentioned in this article and many more',
    viewAllTools: 'View All Tools',
  },
  zh: {
    backToBlog: '← 返回博客',
    relatedArticles: '相关文章',
    publishedOn: '发布于',
    by: '作者',
    minRead: '分钟阅读',
    tags: '标签',
    tableOfContents: '目录',
    shareArticle: '分享此文章',
    aboutAuthor: '关于作者',
    authorBio: 'ChDaoAI 团队由充满热情 的工程师、设计师和内容创作者组成，致力于让强大的 AI 工具惠及每个人。',
    moreFromCategory: '同类更多文章',
    exploreTools: '探索我们的工具',
    toolsDescription: '尝试本文中提到的 AI 驱动工具以及更多其他工具',
    viewAllTools: '查看所有工具',
  },
}

// Parse markdown-like content to extract headings for TOC
function extractHeadings(content: string): { level: number; text: string; id: string }[] {
  const lines = content.split('\n')
  const headings: { level: number; text: string; id: string }[] = []
  let inCodeBlock = false

  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      headings.push({ level, text, id })
    }
  }
  return headings
}

// Render markdown-like content to HTML
function renderContent(content: string): string {
  const lines = content.split('\n')
  let result: string[] = []
  let inCodeBlock = false
  let codeLanguage = ''
  let codeContent: string[] = []
  let inList = false
  let listType: 'ul' | 'ol' = 'ul'

  const flushList = () => {
    if (inList) {
      result.push(`</${listType}>`)
      inList = false
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        flushList()
        inCodeBlock = true
        codeLanguage = line.slice(3).trim()
        codeContent = []
      } else {
        result.push(
          `<pre class="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-6"><code class="language-${codeLanguage}">${codeContent
            .map(l => l.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
            .join('\n')}</code></pre>`
        )
        inCodeBlock = false
        codeContent = []
      }
      continue
    }

    if (inCodeBlock) {
      codeContent.push(line)
      continue
    }

    // Headings
    const h2Match = line.match(/^##\s+(.+)$/)
    if (h2Match) {
      flushList()
      const text = h2Match[1].trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      result.push(
        `<h2 id="${id}" class="text-3xl font-bold text-gray-900 mt-12 mb-6 scroll-mt-20">${escapeHtml(text)}</h2>`
      )
      continue
    }

    const h3Match = line.match(/^###\s+(.+)$/)
    if (h3Match) {
      flushList()
      const text = h3Match[1].trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      result.push(
        `<h3 id="${id}" class="text-2xl font-bold text-gray-900 mt-8 mb-4 scroll-mt-20">${escapeHtml(text)}</h3>`
      )
      continue
    }

    // Tables
    if (line.startsWith('|') && lines[i + 1]?.match(/^\|[\s\-:|]+\|/)) {
      flushList()
      const headerCells = line
        .slice(1, -1)
        .split('|')
        .map(c => c.trim())
      i++ // skip separator
      const rows: string[][] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(
          lines[i]
            .slice(1, -1)
            .split('|')
            .map(c => c.trim())
        )
        i++
      }
      i-- // back up one
      result.push(
        `<div class="overflow-x-auto my-6"><table class="min-w-full divide-y divide-gray-300 border border-gray-200 rounded-lg"><thead class="bg-gray-50"><tr>${headerCells
          .map(c => `<th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">${escapeHtml(c)}</th>`)
          .join('')}</tr></thead><tbody class="divide-y divide-gray-200 bg-white">${rows
          .map(
            row =>
              `<tr>${row
                .map(c => `<td class="px-4 py-3 text-sm text-gray-700">${escapeHtml(c)}</td>`)
                .join('')}</tr>`
          )
          .join('')}</tbody></table></div>`
      )
      continue
    }

    // Unordered list
    if (line.match(/^[-*]\s+/)) {
      if (!inList || listType !== 'ul') {
        flushList()
        result.push('<ul class="list-disc pl-6 my-4 space-y-2 text-gray-700">')
        inList = true
        listType = 'ul'
      }
      const text = line.replace(/^[-*]\s+/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      result.push(`<li class="leading-relaxed">${text}</li>`)
      continue
    }

    // Numbered list
    if (line.match(/^\d+\.\s+/)) {
      if (!inList || listType !== 'ol') {
        flushList()
        result.push('<ol class="list-decimal pl-6 my-4 space-y-2 text-gray-700">')
        inList = true
        listType = 'ol'
      }
      const text = line.replace(/^\d+\.\s+/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      result.push(`<li class="leading-relaxed">${text}</li>`)
      continue
    }

    // Empty line
    if (line.trim() === '') {
      flushList()
      continue
    }

    // Paragraph
    flushList()
    let text = escapeHtml(line)
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code
    text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-pink-600 font-mono">$1</code>')
    // Links
    text = text.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-600 hover:underline">$1</a>'
    )
    result.push(`<p class="text-gray-700 leading-relaxed my-4 text-lg">${text}</p>`)
  }

  flushList()
  return result.join('\n')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const post = getBlogPostBySlug(slug)
  if (!post) notFound()

  const supportedLang: Language = resolveLang(lang)
  const text = (t as any)[supportedLang] || t.en
  const content = pickLocalized(post.content, supportedLang)
  const headings = extractHeadings(content)
  const related = getRelatedPosts(slug, 3)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: pickLocalized(post.title, supportedLang),
    description: pickLocalized(post.description, supportedLang),
    image: 'https://www.chdaoai.com/icon.svg',
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ChDaoAI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.chdaoai.com/icon.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.chdaoai.com/${lang}/blog/${slug}`,
    },
    keywords: pickLocalizedArray(post.tags, supportedLang).join(', '),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `https://www.chdaoai.com/${lang}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `https://www.chdaoai.com/${lang}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: pickLocalized(post.title, supportedLang),
        item: `https://www.chdaoai.com/${lang}/blog/${slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href={`/${supportedLang}/blog`}
              className="inline-block text-white opacity-90 hover:opacity-100 mb-6 text-sm"
            >
              {text.backToBlog}
            </Link>
            <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                {post.category}
              </span>
              {post.featured && (
                <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full font-semibold">
                  ⭐ {text.publishedOn === 'Published on' ? 'Featured' : '精选'}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {pickLocalized(post.title, supportedLang)}
            </h1>
            <p className="text-lg md:text-xl opacity-95 mb-6 leading-relaxed">
              {pickLocalized(post.description, supportedLang)}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
              <span>
                {text.by} <strong>{post.author}</strong>
              </span>
              <span>·</span>
              <span>
                {new Date(post.publishedAt).toLocaleDateString(
                  supportedLang === 'zh' ? 'zh-CN' : 'en-US',
                  { year: 'numeric', month: 'long', day: 'numeric' }
                )}
              </span>
              <span>·</span>
              <span>{pickLocalized(post.readingTime, supportedLang)}</span>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar - Table of Contents */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24">
                {headings.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">
                      {text.tableOfContents}
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {headings.map((h, idx) => (
                        <li key={idx} className={h.level === 3 ? 'pl-4' : ''}>
                          <a
                            href={`#${h.id}`}
                            className="text-gray-600 hover:text-blue-600 transition line-clamp-2"
                          >
                            {h.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pickLocalizedArray(post.tags, supportedLang).length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">
                      {text.tags}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {pickLocalizedArray(post.tags, supportedLang).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-white text-gray-700 px-3 py-1 rounded-full border border-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Main content */}
            <article className="lg:col-span-3 order-1 lg:order-2 max-w-none">
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: renderContent(content) }}
              />

              {/* Author bio */}
              <div className="mt-16 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {text.aboutAuthor}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">{post.author}</strong> — {text.authorBio}
                </p>
              </div>

              {/* Tools CTA */}
              <div className="mt-12 p-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white">
                <h3 className="text-2xl font-bold mb-3">
                  {text.exploreTools}
                </h3>
                <p className="opacity-95 mb-6">
                  {text.toolsDescription}
                </p>
                <Link
                  href={`/${supportedLang}/remove-watermark`}
                  className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  {text.viewAllTools} →
                </Link>
              </div>
            </article>
          </div>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                {text.relatedArticles}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {related.map(rp => (
                  <Link
                    key={rp.slug}
                    href={`/${supportedLang}/blog/${rp.slug}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition group"
                  >
                    <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <div className="text-5xl">
                        {rp.category === 'ai' && '🤖'}
                        {rp.category === 'tutorial' && '📖'}
                        {rp.category === 'image' && '🖼️'}
                        {rp.category === 'video' && '🎬'}
                        {rp.category === 'audio' && '🎵'}
                        {rp.category === 'pdf' && '📄'}
                        {rp.category === 'news' && '📰'}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
                        {pickLocalized(rp.title, supportedLang)}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {pickLocalized(rp.description, supportedLang)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  )
}
