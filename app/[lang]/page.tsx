import { getToolBySlug, getPopularTools, getAITools, tools, categoryInfo } from '@/lib/tools-catalog'
import { getBlogPostsForHome } from '@/lib/blog-data'
import { guides } from '@/lib/guides-data'
import type { Metadata } from 'next'

type Language = 'en' | 'zh' | 'ru' | 'ar' | 'de' | 'ja' | 'fr' | 'es' | 'pt' | 'ko'
const isSupportedLang = (lang: string): lang is Language =>
  ['en', 'zh', 'ru', 'ar', 'de', 'ja', 'fr', 'es', 'pt', 'ko'].includes(lang)

const t = {
  en: {
    heroTitle: 'AI-Powered Tools for Every Digital Task',
    heroSubtitle: 'Remove watermarks, edit images, transcribe audio, merge PDFs, generate subtitles, and more — 80+ professional tools in one platform.',
    heroDescription: 'Trusted by creators, professionals, and businesses worldwide. Fast, secure, and accurate. Available in 10 languages.',
    heroCTA: 'Try Free Now',
    heroSecondary: 'View All Tools',
    popularToolsTitle: 'Most Popular Tools',
    popularToolsSubtitle: 'Used by thousands of creators and professionals every day',
    exploreAll: 'Explore All 80+ Tools',
    aiToolsTitle: 'Cutting-Edge AI Tools',
    aiToolsSubtitle: 'Powered by state-of-the-art machine learning models',
    categoryTitle: 'Browse Tools by Category',
    categorySubtitle: 'Find the right tool for your specific task',
    aboutTitle: 'Why Choose ChDaoAI?',
    aboutSubtitle: 'A complete platform for digital content creation and processing',
    featuresTitle: 'Built for Professionals, Free for Everyone',
    featuresSubtitle: 'What makes our platform the preferred choice for over 500,000 users',
    statsTitle: 'Trusted Worldwide',
    statsSubtitle: 'Numbers that reflect our commitment to quality',
    blogTitle: 'From the Blog',
    blogSubtitle: 'Expert insights, tutorials, and product updates',
    guidesTitle: 'Step-by-Step Guides',
    guidesSubtitle: 'Learn how to get the most out of every tool',
    ctaTitle: 'Ready to Get Started?',
    ctaSubtitle: 'Join hundreds of thousands of users who trust ChDaoAI for their digital workflow. Sign up free and get 100 credits to try any tool.',
    signupCTA: 'Sign Up Free',
    pricingCTA: 'View Pricing',
    platformsTitle: 'Comprehensive Tool Library',
    platformsSubtitle: 'From image processing to PDF management, we have the tools you need',
    statUsers: 'Active Users',
    statTools: 'AI-Powered Tools',
    statLanguages: 'Languages Supported',
    statUptime: 'Service Uptime',
  },
  zh: {
    heroTitle: '面向每个数字任务的AI驱动工具',
    heroSubtitle: '去除水印、编辑图像、转录音频、合并PDF、生成字幕等 — 一个平台集成80多种专业工具。',
    heroDescription: '受到全球创作者、专业人士和企业信赖。快速、安全、准确。支持10种语言。',
    heroCTA: '免费试用',
    heroSecondary: '查看所有工具',
    popularToolsTitle: '最受欢迎的工具',
    popularToolsSubtitle: '每天有数千名创作者和专业人士使用',
    exploreAll: '探索全部80+种工具',
    aiToolsTitle: '前沿AI工具',
    aiToolsSubtitle: '由最先进的机器学习模型驱动',
    categoryTitle: '按类别浏览工具',
    categorySubtitle: '为您的特定任务找到合适的工具',
    aboutTitle: '为什么选择ChDaoAI？',
    aboutSubtitle: '用于数字内容创建和处理的完整平台',
    featuresTitle: '为专业人士打造，人人免费',
    featuresSubtitle: '我们成为超过50万用户首选的原因',
    statsTitle: '全球信赖',
    statsSubtitle: '反映我们对质量承诺的数据',
    blogTitle: '博客精选',
    blogSubtitle: '专家见解、教程和产品更新',
    guidesTitle: '分步指南',
    guidesSubtitle: '学习如何充分利用每个工具',
    ctaTitle: '准备好开始了吗？',
    ctaSubtitle: '加入数十万信赖ChDaoAI进行数字工作流的用户。免费注册，获得100积分即可试用任何工具。',
    signupCTA: '免费注册',
    pricingCTA: '查看价格',
    platformsTitle: '全面的工具库',
    platformsSubtitle: '从图像处理到PDF管理，我们拥有您需要的工具',
    statUsers: '活跃用户',
    statTools: 'AI驱动工具',
    statLanguages: '支持语言',
    statUptime: '服务正常运行时间',
  },
  // For other languages, gracefully fall back to English
  ru: {} as any, ar: {} as any, de: {} as any, ja: {} as any, fr: {} as any, es: {} as any, pt: {} as any, ko: {} as any,
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const supportedLang = isSupportedLang(lang) ? lang : 'en'
  const isZh = supportedLang === 'zh'

  const title = isZh
    ? 'ChDaoAI - 80多种AI驱动的图像、视频、音频、PDF工具 | 全部免费试用'
    : 'ChDaoAI - 80+ AI-Powered Tools for Images, Videos, Audio, PDFs | Free to Try'
  const description = isZh
    ? '一站式AI工具平台：图片去水印、AI抠图、视频转文字、PDF合并、字幕翻译、二维码生成等。免费试用，专业品质。'
    : 'All-in-one AI tools platform: remove watermarks, remove image backgrounds, transcribe video to text, merge PDFs, translate subtitles, generate QR codes. Free to try, professional quality.'
  return {
    title,
    description,
    keywords: 'AI tools, image tools, video tools, PDF tools, audio tools, subtitle tools, watermark remover, background remover, AI image generator, free online tools',
    alternates: {
      canonical: `https://www.chdaoai.com/${supportedLang}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.chdaoai.com/${supportedLang}`,
    },
  }
}

// FAQ Section Component
function FAQSection({ isZh, supportedLang }: { isZh: boolean; supportedLang: string }) {
  const faqItems = isZh
    ? [
        { q: 'ChDaoAI 是免费的吗？', a: '是的，ChDaoAI 提供免费层，新用户注册即可获得 100 免费积分，无需信用卡。您可以使用这些积分试用我们任何工具。对于常规使用，我们提供三个付费计划（基础、标准、高级）以满足不同需求。' },
        { q: '我可以使用 ChDaoAI 商业用途吗？', a: '可以。所有付费计划都包含商业使用许可。免费层仅供个人试用和评估。请注意，您应确保对上传的文件拥有合法权利。' },
        { q: '我的文件安全吗？', a: '绝对安全。所有文件都通过 TLS 加密传输，并在处理完成后 1 小时内自动删除。我们从不使用您的文件训练 AI 模型，从不出售您的数据。' },
        { q: '支持哪些语言？', a: '我们的界面、文档和客户支持覆盖 10 种语言：英语、中文、俄语、阿拉伯语、德语、日语、法语、西班牙语、葡萄牙语和韩语。' },
        { q: '如何联系客服？', a: '您可以通过 support@chdaoai.com 联系我们，或在我们的联系页面上填写表单。我们的团队通常在 24 小时内回复所有询问。' },
        { q: '是否提供 API 接入？', a: '是的，我们提供 API 接入，允许您将我们的 AI 工具集成到自己的应用程序中。请联系我们的销售团队了解定价和技术细节。' },
        { q: '可以退款吗？', a: '可以。我们为所有订阅计划提供 7 天无理由退款保证。如果您对服务不满意，请在购买后 7 天内联系我们的客服团队。' },
      ]
    : [
        { q: 'Is ChDaoAI free to use?', a: 'Yes, ChDaoAI offers a free tier with 100 free credits for new signups, no credit card required. You can use these credits to try any of our tools. For regular use, we offer three paid plans (Basic, Standard, Premium) to fit different needs and budgets.' },
        { q: 'Can I use ChDaoAI for commercial purposes?', a: 'Yes, all paid plans include commercial usage rights. The free tier is for personal trial and evaluation only. Please ensure you have legal rights to any files you upload.' },
        { q: 'Are my files secure?', a: 'Absolutely. All files are transmitted over TLS encryption and automatically deleted within 1 hour of processing. We never use your files to train AI models and never sell your data.' },
        { q: 'Which languages are supported?', a: 'Our interface, documentation, and customer support are available in 10 languages: English, Chinese, Russian, Arabic, German, Japanese, French, Spanish, Portuguese, and Korean.' },
        { q: 'How do I contact customer support?', a: 'You can reach us at support@chdaoai.com or by filling out the form on our contact page. Our team typically responds to all inquiries within 24 hours.' },
        { q: 'Is there an API available?', a: 'Yes, we offer API access that allows you to integrate our AI tools into your own applications. Please contact our sales team for pricing and technical details.' },
        { q: 'Can I get a refund?', a: 'Yes. We offer a 7-day money-back guarantee on all subscription plans. If you are not satisfied with our service, please contact our support team within 7 days of purchase.' },
      ]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  return (
    <section className="py-16 bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {isZh ? '常见问题' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-lg text-gray-600">
            {isZh ? '快速解答您最关心的问题' : 'Quick answers to the questions we hear most often'}
          </p>
        </div>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group"
            >
              <summary className="w-full px-6 py-4 text-left flex justify-between items-center cursor-pointer hover:bg-gray-50 transition font-semibold text-gray-900 list-none">
                <span>{item.q}</span>
                <span className="text-blue-600 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="px-6 py-4 bg-gray-50 text-gray-700 leading-relaxed border-t border-gray-200">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

const popularToolSlugs = ['remove-watermark', 'ai-remove-background', 'image-compress', 'video-to-text', 'pdf-merge', 'audio-format-conversion', 'audio-to-text', 'qrcode-generate']

const featureSlugs = [
  { icon: '🚀', titleKey: 'Fast Processing', descKey: 'GPU-accelerated infrastructure delivers results in seconds, not minutes. Most tools complete in under 10 seconds.' },
  { icon: '🔒', titleKey: 'Privacy First', descKey: 'Your files are processed securely and automatically deleted after 1 hour. We never use your content to train AI models.' },
  { icon: '🌍', titleKey: '10 Languages', descKey: 'Full interface and customer support in 10 languages. Used by professionals in over 150 countries.' },
  { icon: '💎', titleKey: 'Professional Quality', descKey: 'The same AI models used by Fortune 500 companies, available to everyone with a free tier.' },
  { icon: '💰', titleKey: 'Free to Start', descKey: '100 free credits when you sign up. No credit card required. Try before you buy.' },
  { icon: '🔄', titleKey: 'Batch Processing', descKey: 'Process hundreds of files at once. Perfect for teams, agencies, and high-volume workflows.' },
]

const benefitSlugs = [
  { icon: '🎯', title: 'One Platform, Every Tool', desc: 'Stop juggling multiple subscriptions. Image, video, audio, PDF, CSV, eBook, and QR code tools — all in one place with a single account.' },
  { icon: '⚡', title: 'Production-Grade Speed', desc: 'Our GPU-accelerated pipeline processes most operations in under 10 seconds. Bulk operations scale to thousands of files.' },
  { icon: '🛡️', title: 'Enterprise-Grade Security', desc: 'TLS encryption in transit, encrypted storage, automatic file deletion. SOC2-aligned practices. Used by regulated industries.' },
  { icon: '🤝', title: 'Human Support', desc: 'Real engineers respond to your questions within 24 hours. No chatbots, no offshore call centers.' },
  { icon: '📈', title: 'Always Improving', desc: 'We ship new features and improvements every week. Your subscription gives you access to every new tool we launch.' },
  { icon: '🎓', title: 'Free Education', desc: 'Active students and verified educators get 50% off all paid plans. We believe tools should be accessible to learners.' },
]

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const supportedLang = isSupportedLang(lang) ? lang : 'en'
  const text = (t[supportedLang] || t.en) as any
  const isZh = supportedLang === 'zh'

  const popularTools = popularToolSlugs
    .map(slug => getToolBySlug(slug))
    .filter(Boolean)
  const aiTools = getAITools(4)
  const recentPosts = getBlogPostsForHome(3)
  const recentGuides = guides.slice(0, 3)

  // Build Schema.org Organization + WebSite + ItemList JSON-LD
  const siteUrl = `https://www.chdaoai.com/${supportedLang}`

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ChDaoAI',
    url: 'https://www.chdaoai.com',
    logo: 'https://www.chdaoai.com/icon.svg',
    description: 'AI-powered online tools for images, videos, audio, PDFs, and more',
    sameAs: [
      'https://twitter.com/chdaoai',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@chdaoai.com',
      availableLanguage: ['English', 'Chinese', 'Russian', 'Arabic', 'German', 'Japanese', 'French', 'Spanish', 'Portuguese', 'Korean'],
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ChDaoAI',
    url: 'https://www.chdaoai.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.chdaoai.com/${supportedLang}/blog?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  const toolsListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ChDaoAI Tools Catalog',
    numberOfItems: tools.length,
    itemListElement: tools.slice(0, 20).map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.title.en,
      url: `https://www.chdaoai.com/${supportedLang}/${t.slug}`,
      description: t.shortDescription.en,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsListSchema) }}
      />

      <div className="min-h-screen bg-white">
        {/* HERO */}
        <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>80+ AI tools · 10 languages · {tools.length} tools total</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {text.heroTitle}
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl mb-4 opacity-95 max-w-3xl mx-auto leading-relaxed">
                {text.heroSubtitle}
              </p>
              <p className="text-base md:text-lg mb-10 opacity-85 max-w-2xl mx-auto">
                {text.heroDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`/${supportedLang}/auth/register`}
                  className="inline-block bg-white text-blue-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-xl"
                >
                  {text.heroCTA} →
                </a>
                <a
                  href={`/${supportedLang}/tools`}
                  className="inline-block bg-white/10 backdrop-blur border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/20 transition"
                >
                  {text.heroSecondary}
                </a>
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm opacity-90">
                <span>✓ No credit card required</span>
                <span>✓ 100 free credits</span>
                <span>✓ Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* PLATFORMS / CATEGORIES OVERVIEW */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {text.platformsTitle}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {text.platformsSubtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(categoryInfo).map(([key, info]) => {
                const toolCount = tools.filter(t => t.category === key).length
                return (
                  <a
                    key={key}
                    href={`/${supportedLang}/tools#${key}`}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100 group"
                  >
                    <div className="text-4xl mb-3">{info.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                      {isZh ? info.name.zh : info.name.en}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      {isZh ? info.description.zh : info.description.en}
                    </p>
                    <span className="text-blue-600 text-sm font-medium">
                      {toolCount} tools →
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        </section>

        {/* POPULAR TOOLS */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  {text.popularToolsTitle}
                </h2>
                <p className="text-lg text-gray-600">
                  {text.popularToolsSubtitle}
                </p>
              </div>
              <a
                href={`/${supportedLang}/tools`}
                className="mt-4 md:mt-0 inline-block text-blue-600 font-semibold hover:text-blue-700"
              >
                {text.exploreAll} →
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularTools.map((tool: any) => (
                <a
                  key={tool.slug}
                  href={`/${supportedLang}/${tool.slug}`}
                  className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition group"
                >
                  <div className="text-3xl mb-3">{categoryInfo[tool.category as keyof typeof categoryInfo].icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                    {isZh ? tool.title.zh : tool.title.en}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                    {isZh ? tool.shortDescription.zh : tool.shortDescription.en}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* AI TOOLS */}
        <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                AI-POWERED
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {text.aiToolsTitle}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {text.aiToolsSubtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aiTools.map((tool) => (
                <a
                  key={tool.slug}
                  href={`/${supportedLang}/${tool.slug}`}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group"
                >
                  <div className="text-3xl mb-3">🤖</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                    {isZh ? tool.title.zh : tool.title.en}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {isZh ? tool.shortDescription.zh : tool.shortDescription.en}
                  </p>
                  {tool.isNew && (
                    <span className="inline-block mt-3 text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-0.5 rounded-full">
                      NEW
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {text.featuresTitle}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {text.featuresSubtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featureSlugs.map((f, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">{f.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{f.titleKey}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{f.descKey}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {text.aboutTitle}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {text.aboutSubtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefitSlugs.map((b, i) => (
                <div key={i} className="bg-white p-8 rounded-xl shadow-sm">
                  <div className="text-4xl mb-4">{b.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{b.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                {text.statsTitle}
              </h2>
              <p className="text-lg opacity-80">
                {text.statsSubtitle}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">500K+</div>
                <div className="text-gray-300 text-sm">{text.statUsers}</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">{tools.length}+</div>
                <div className="text-gray-300 text-sm">{text.statTools}</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">10</div>
                <div className="text-gray-300 text-sm">{text.statLanguages}</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">99.9%</div>
                <div className="text-gray-300 text-sm">{text.statUptime}</div>
              </div>
            </div>
          </div>
        </section>

        {/* BLOG */}
        {recentPosts.length > 0 && (
          <section className="py-16 bg-white">
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
                <a
                  href={`/${supportedLang}/blog`}
                  className="mt-4 md:mt-0 inline-block text-blue-600 font-semibold hover:text-blue-700"
                >
                  All articles →
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {recentPosts.map((post) => (
                  <a
                    key={post.slug}
                    href={`/${supportedLang}/blog/${post.slug}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition group border border-gray-100"
                  >
                    <div className="h-40 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-5xl">📚</span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
                        {isZh ? post.title.zh : post.title.en}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {isZh ? post.description.zh : post.description.en}
                      </p>
                      <span className="text-xs text-gray-500">
                        {isZh ? post.readingTime.zh : post.readingTime.en}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* GUIDES */}
        {recentGuides.length > 0 && (
          <section className="py-16 bg-gray-50">
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
                <a
                  href={`/${supportedLang}/guides`}
                  className="mt-4 md:mt-0 inline-block text-blue-600 font-semibold hover:text-blue-700"
                >
                  All guides →
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {recentGuides.map((guide) => (
                  <a
                    key={guide.slug}
                    href={`/${supportedLang}/guides/${guide.slug}`}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100"
                  >
                    <div className="text-xs text-blue-600 font-semibold mb-2 uppercase tracking-wider">
                      {isZh ? guide.difficulty.zh : guide.difficulty.en}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {isZh ? guide.title.zh : guide.title.en}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {isZh ? guide.description.zh : guide.description.en}
                    </p>
                    <span className="text-xs text-gray-500">
                      {isZh ? guide.readingTime.zh : guide.readingTime.en}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ SECTION with Schema */}
        <FAQSection isZh={isZh} supportedLang={supportedLang} />

        {/* SEO-CRITICAL LONG-FORM CONTENT */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <article className="prose prose-lg max-w-none">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {isZh
                  ? 'ChDaoAI：完整的AI驱动数字工具平台'
                  : 'ChDaoAI: The Complete AI-Powered Digital Tools Platform'}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {isZh
                  ? 'ChDaoAI 是一个综合性的在线工具平台，汇集了80多种AI驱动的工具，覆盖图像处理、视频编辑、音频转录、PDF管理、字幕生成、二维码和条形码处理等各个领域。我们的使命是让每个人都能轻松使用最先进的人工智能技术，无需昂贵的软件、复杂的学习曲线或专业培训。'
                  : 'ChDaoAI is a comprehensive online tools platform that brings together more than 80 AI-powered tools covering image processing, video editing, audio transcription, PDF management, subtitle generation, QR and barcode processing, and more. Our mission is to make cutting-edge artificial intelligence accessible to everyone, without expensive software, steep learning curves, or specialized training.'}
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                {isZh ? '我们提供的工具类别' : 'Tool Categories We Offer'}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                {isZh
                  ? '无论您是内容创作者、小企业主、学生还是营销专业人员，ChDaoAI 都有适合您工作流的工具。我们的工具分为9个主要类别，每个类别都包含多个专业工具：'
                  : 'Whether you are a content creator, small business owner, student, or marketing professional, ChDaoAI has tools that fit your workflow. Our tools are organized into 9 main categories, each containing multiple specialized utilities:'}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li>
                  <strong>{isZh ? '图片工具' : 'Image Tools'}</strong> —{' '}
                  {isZh
                    ? '使用AI去水印、AI抠图、AI变龄、性别转换、美颜、文生图、绘画生成、漫画创作、压缩、格式转换、马赛克、网格、九宫格、圆角、裁剪、灰度、文字转图、放大、换背景、老照片修复、旋转、ICO生成、加水印、加文字、上色、查看EXIF、图床、合并等30+工具。'
                    : '30+ tools including AI watermark removal, background removal, age change, gender swap, face beautify, text-to-image, drawing generation, comic creation, compression, format conversion, mosaic, grid, nine-grid, rounded corners, crop, grayscale, text-to-image, upscale, change background, photo restoration, rotate, ICO generation, add watermark, add text, colorize, EXIF viewer, image hosting, merge, and more.'}
                </li>
                <li>
                  <strong>{isZh ? '视频工具' : 'Video Tools'}</strong> —{' '}
                  {isZh
                    ? '视频去水印、视频转文字、视频提取音频、老视频修复、AI文生视频等。'
                    : 'Video watermark removal, video-to-text, video audio extraction, old video restoration, AI text-to-video, and more.'}
                </li>
                <li>
                  <strong>{isZh ? '音频工具' : 'Audio Tools'}</strong> —{' '}
                  {isZh
                    ? '音频格式转换、音频转文字、音频生成字幕、音频合并、人声分离、音频修复等。'
                    : 'Audio format conversion, audio-to-text, audio-to-subtitles, audio merge, vocal separation, audio repair, and more.'}
                </li>
                <li>
                  <strong>{isZh ? '字幕工具' : 'Subtitle Tools'}</strong> —{' '}
                  {isZh
                    ? '文字生成字幕、字幕转文字、字幕格式转换、字幕翻译、字幕合并等。'
                    : 'Text-to-subtitles, subtitles-to-text, subtitle format conversion, subtitle translation, subtitle merge, and more.'}
                </li>
                <li>
                  <strong>{isZh ? 'PDF工具' : 'PDF Tools'}</strong> —{' '}
                  {isZh
                    ? '合并、拆分、去重、转换、转音频、转文本、转字幕、翻译、加水印、去水印、文档转PDF等。'
                    : 'Merge, split, deduplicate, convert, to-audio, to-text, to-subtitles, translate, add watermark, remove watermark, document-to-PDF, and more.'}
                </li>
                <li>
                  <strong>{isZh ? 'CSV工具' : 'CSV Tools'}</strong> —{' '}
                  {isZh ? '合并、拆分、去重。' : 'Merge, split, deduplicate.'}
                </li>
                <li>
                  <strong>{isZh ? '电子书工具' : 'eBook Tools'}</strong> —{' '}
                  {isZh
                    ? '合并、文档转电子书、去水印、转有声书、转字幕、格式转换。'
                    : 'Merge, document-to-ebook, watermark removal, to-audiobook, to-subtitles, format conversion.'}
                </li>
                <li>
                  <strong>{isZh ? '二维码和条形码工具' : 'QR & Barcode Tools'}</strong> —{' '}
                  {isZh ? '生成和识别。' : 'Generation and recognition.'}
                </li>
              </ul>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                {isZh ? '谁在使用 ChDaoAI？' : 'Who Uses ChDaoAI?'}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                {isZh
                  ? 'ChDaoAI 服务于全球150多个国家的50多万用户。我们的用户群体包括：'
                  : 'ChDaoAI serves more than 500,000 users in over 150 countries. Our user base includes:'}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li>{isZh ? '内容创作者和YouTuber，使用AI工具加速视频和图像处理' : 'Content creators and YouTubers who use AI tools to speed up video and image processing'}</li>
                <li>{isZh ? '电子商务商家，准备产品图片和营销材料' : 'E-commerce merchants preparing product images and marketing materials'}</li>
                <li>{isZh ? '营销专业人员，创建多语言内容和本地化材料' : 'Marketing professionals creating multilingual content and localized materials'}</li>
                <li>{isZh ? '学生和研究人员，转录音频、转换PDF格式' : 'Students and researchers transcribing audio and converting PDF formats'}</li>
                <li>{isZh ? '小型企业主，需要专业质量的工具但预算有限' : 'Small business owners who need professional-quality tools on a limited budget'}</li>
                <li>{isZh ? '开发人员，将我们的API集成到自己的应用程序中' : 'Developers integrating our API into their own applications'}</li>
                <li>{isZh ? '翻译人员，处理字幕翻译和文档翻译' : 'Translators handling subtitle translation and document translation'}</li>
                <li>{isZh ? '法律、医疗和教育专业人士，处理敏感文档' : 'Legal, medical, and education professionals handling sensitive documents'}</li>
              </ul>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                {isZh ? '为什么 ChDaoAI 与众不同？' : 'Why ChDaoAI is Different'}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                {isZh
                  ? '在充斥着低质量工具的在线工具市场中，ChDaoAI 通过对质量、隐私和用户体验的承诺脱颖而出：'
                  : 'In a market crowded with low-quality tools, ChDaoAI stands out through its commitment to quality, privacy, and user experience:'}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li><strong>{isZh ? '生产级AI模型' : 'Production-grade AI models'}</strong> — {isZh ? '我们使用的AI模型与财富500强公司使用的相同，但价格人人负担得起。' : 'The same AI models used by Fortune 500 companies, available to everyone at an accessible price.'}</li>
                <li><strong>{isZh ? '隐私优先' : 'Privacy first'}</strong> — {isZh ? '所有上传的文件在1小时后自动删除。我们从不使用您的内容训练AI模型。' : 'All uploaded files are automatically deleted after 1 hour. We never use your content to train AI models.'}</li>
                <li><strong>{isZh ? '透明定价' : 'Transparent pricing'}</strong> — {isZh ? '基于积分的简单定价。注册即送100免费积分，无需信用卡。' : 'Simple credit-based pricing. Get 100 free credits on signup, no credit card required.'}</li>
                <li><strong>{isZh ? '持续更新' : 'Always up to date'}</strong> — {isZh ? '我们每周发布新功能和改进。订阅可访问我们发布的每个新工具。' : 'We ship new features and improvements every week. Your subscription gives access to every new tool we launch.'}</li>
                <li><strong>{isZh ? '真正的多语言支持' : 'True multilingual support'}</strong> — {isZh ? '完整界面、文档和客户支持覆盖10种语言。' : 'Complete interface, documentation, and customer support in 10 languages.'}</li>
                <li><strong>{isZh ? '免费学习' : 'Free to learn'}</strong> — {isZh ? '学生和教师享受所有付费计划50%折扣。' : 'Active students and verified teachers get 50% off all paid plans.'}</li>
              </ul>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                {isZh ? '立即开始' : 'Get Started Today'}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                {isZh
                  ? '创建免费账户只需几秒钟，无需信用卡。注册后您将自动获得100积分，可用于试用我们任何工具。对于常规使用，我们提供三个付费计划，满足从个人创作者到大型企业的各种需求。访问我们的定价页面了解更多信息。'
                  : 'Creating a free account takes just seconds, with no credit card required. After signing up, you\'ll automatically receive 100 credits to try any of our tools. For regular use, we offer three paid plans to suit everyone from individual creators to large enterprises. Visit our pricing page to learn more.'}
              </p>
            </article>
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
                href={`/${supportedLang}/auth/register`}
                className="inline-block bg-white text-blue-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-xl"
              >
                {text.signupCTA} →
              </a>
              <a
                href={`/${supportedLang}/subscribe`}
                className="inline-block bg-blue-500 border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-400 transition"
              >
                {text.pricingCTA}
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
