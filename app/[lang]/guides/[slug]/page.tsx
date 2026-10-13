import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { guides, getGuideBySlug, getRelatedGuides } from '@/lib/guides-data'

type Language = 'en' | 'zh'
const isZhLang = (lang: string): boolean => lang === 'zh'

const t = {
  en: {
    backToGuides: '← Back to Guides',
    relatedGuides: 'Related Guides',
    tableOfContents: 'Table of Contents',
    publishedIn: 'Published in',
    difficulty: 'Level',
    readTime: 'Reading time',
    exploreTools: 'Try the Tools Mentioned',
    exploreToolsDesc: 'Put what you learned into practice with the tools discussed in this guide.',
    viewAllTools: 'View All Tools',
  },
  zh: {
    backToGuides: '← 返回指南',
    relatedGuides: '相关指南',
    tableOfContents: '目录',
    publishedIn: '发布于',
    difficulty: '难度',
    readTime: '阅读时间',
    exploreTools: '试用提到的工具',
    exploreToolsDesc: '使用本指南中讨论的工具，将您学到的知识付诸实践。',
    viewAllTools: '查看所有工具',
  },
}

export async function generateStaticParams() {
  return guides.map(g => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) return {}
  const isZh = isZhLang(lang)
  const title = isZh ? guide.title.zh : guide.title.en
  const description = isZh ? guide.description.zh : guide.description.en
  return {
    title: `${title} | ChDaoAI Guides`,
    description,
    keywords: `${title}, ${description}, ChDaoAI guide, tutorial, how to`,
    authors: [{ name: 'ChDaoAI Team' }],
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.chdaoai.com/${lang}/guides/${slug}`,
    },
    alternates: {
      canonical: `https://www.chdaoai.com/${lang}/guides/${slug}`,
    },
  }
}

// Reuse the markdown renderer from blog post page (same logic)
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

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
    if (inCodeBlock) { codeContent.push(line); continue }

    const h2Match = line.match(/^##\s+(.+)$/)
    if (h2Match) {
      flushList()
      const text = h2Match[1].trim()
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
      result.push(`<h2 id="${id}" class="text-3xl font-bold text-gray-900 mt-12 mb-6 scroll-mt-20">${escapeHtml(text)}</h2>`)
      continue
    }
    const h3Match = line.match(/^###\s+(.+)$/)
    if (h3Match) {
      flushList()
      const text = h3Match[1].trim()
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
      result.push(`<h3 id="${id}" class="text-2xl font-bold text-gray-900 mt-8 mb-4 scroll-mt-20">${escapeHtml(text)}</h3>`)
      continue
    }

    if (line.startsWith('|') && lines[i + 1]?.match(/^\|[\s\-:|]+\|/)) {
      flushList()
      const headerCells = line.slice(1, -1).split('|').map(c => c.trim())
      i++
      const rows: string[][] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(lines[i].slice(1, -1).split('|').map(c => c.trim()))
        i++
      }
      i--
      result.push(
        `<div class="overflow-x-auto my-6"><table class="min-w-full divide-y divide-gray-300 border border-gray-200 rounded-lg"><thead class="bg-gray-50"><tr>${headerCells
          .map(c => `<th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">${escapeHtml(c)}</th>`)
          .join('')}</tr></thead><tbody class="divide-y divide-gray-200 bg-white">${rows
          .map(row => `<tr>${row.map(c => `<td class="px-4 py-3 text-sm text-gray-700">${escapeHtml(c)}</td>`).join('')}</tr>`)
          .join('')}</tbody></table></div>`
      )
      continue
    }

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
    if (line.trim() === '') {
      flushList()
      continue
    }
    flushList()
    let text = escapeHtml(line)
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>')
    text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-pink-600 font-mono">$1</code>')
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
    result.push(`<p class="text-gray-700 leading-relaxed my-4 text-lg">${text}</p>`)
  }
  flushList()
  return result.join('\n')
}

export default async function GuideDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) notFound()
  const isZh = isZhLang(lang)
  const text = isZh ? t.zh : t.en
  const content = isZh ? guide.content.zh : guide.content.en
  const headings = extractHeadings(content)
  const related = getRelatedGuides(slug, 3)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: isZh ? guide.title.zh : guide.title.en,
    description: isZh ? guide.description.zh : guide.description.en,
    image: 'https://www.chdaoai.com/icon.svg',
    datePublished: '2024-01-01',
    dateModified: '2024-12-01',
    author: {
      '@type': 'Organization',
      name: 'ChDaoAI Team',
      url: 'https://www.chdaoai.com',
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
      '@id': `https://www.chdaoai.com/${lang}/guides/${slug}`,
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://www.chdaoai.com/${lang}` },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `https://www.chdaoai.com/${lang}/guides` },
      { '@type': 'ListItem', position: 3, name: isZh ? guide.title.zh : guide.title.en, item: `https://www.chdaoai.com/${lang}/guides/${slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="min-h-screen bg-white">
        {/* HEADER */}
        <header className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href={`/${lang}/guides`} className="inline-block text-white opacity-90 hover:opacity-100 mb-6 text-sm">
              {text.backToGuides}
            </Link>
            <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                {isZh ? guide.difficulty.zh : guide.difficulty.en}
              </span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                {isZh ? guide.readingTime.zh : guide.readingTime.en}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {isZh ? guide.title.zh : guide.title.en}
            </h1>
            <p className="text-lg md:text-xl opacity-95 mb-6 leading-relaxed">
              {isZh ? guide.description.zh : guide.description.en}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
              <span>
                {text.publishedIn} <strong>ChDaoAI</strong>
              </span>
              <span>·</span>
              <span>
                <strong>{text.difficulty}:</strong> {isZh ? guide.difficulty.zh : guide.difficulty.en}
              </span>
              <span>·</span>
              <span>
                <strong>{text.readTime}:</strong> {isZh ? guide.readingTime.zh : guide.readingTime.en}
              </span>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24">
                {headings.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">
                      {text.tableOfContents}
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {headings.map((h, idx) => (
                        <li key={idx} className={h.level === 3 ? 'pl-4' : ''}>
                          <a href={`#${h.id}`} className="text-gray-600 hover:text-blue-600 transition line-clamp-2">
                            {h.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </aside>

            <article className="lg:col-span-3 order-1 lg:order-2 max-w-none">
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: renderContent(content) }}
              />

              <div className="mt-16 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{text.exploreTools}</h3>
                <p className="text-gray-700 leading-relaxed mb-6">{text.exploreToolsDesc}</p>
                <Link
                  href={`/${lang}/tools`}
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  {text.viewAllTools} →
                </Link>
              </div>
            </article>
          </div>
        </div>

        {related.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                {text.relatedGuides}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {related.map(rg => (
                  <Link
                    key={rg.slug}
                    href={`/${lang}/guides/${rg.slug}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition group"
                  >
                    <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <span className="text-5xl">📖</span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
                        {isZh ? rg.title.zh : rg.title.en}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {isZh ? rg.description.zh : rg.description.en}
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
