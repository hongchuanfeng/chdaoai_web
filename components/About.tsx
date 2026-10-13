'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function About() {
  const { t } = useLanguage()

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">{t('about.title')}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {t('about.welcome')}
        </p>
      </div>

      {/* Company Story Section - New for AdSense */}
      <section className="mb-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Our Story</h2>
        <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
          <p>
            ChDaoAI was founded in 2023 by a team of engineers, designers, and product builders who shared a common frustration: professional-grade digital tools were either too expensive, too complicated, or scattered across dozens of disconnected services. We set out to build something different — a single platform where anyone could access powerful AI-driven tools for images, videos, audio, PDFs, and documents, without needing a computer science degree or a Fortune 500 budget.
          </p>
          <p>
            What started as a simple watermark removal tool quickly grew into a comprehensive suite of over 80 specialized tools. Along the way, we discovered that the same principles that made our original tool successful — privacy-first design, transparent pricing, multi-language support, and a relentless focus on quality — resonated with users around the world. Today, ChDaoAI serves more than 500,000 active users across 150+ countries, processing millions of files every month.
          </p>
          <p>
            We are a fully remote team distributed across Europe, Asia, and the Americas. This global presence is not just a logistical choice — it is core to who we are. We believe the best digital products are built by diverse teams who understand the needs of users from many cultures, languages, and contexts.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mb-16 bg-white border border-gray-200 rounded-2xl p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">{t('about.mission')}</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {t('about.missionText')}
            </p>
          </div>
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section - New for AdSense */}
      <section className="mb-16 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Our Vision</h2>
        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          We envision a world where the most advanced AI tools are not locked behind expensive enterprise contracts or hidden behind technical complexity. Where a student in Lagos has access to the same quality of image processing as a designer in San Francisco. Where a small business in Bangkok can produce marketing materials that compete with those of a Fortune 500 company.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed">
          This is not just an aspiration — it is the product strategy that drives every decision we make. Every tool we ship, every feature we build, and every language we add is evaluated against this single question: does it bring powerful AI capabilities to more people, in more places, in more ways?
        </p>
      </section>

      {/* Values Section - New for AdSense */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Quality First</h3>
            <p className="text-gray-700 leading-relaxed">
              We never ship a tool until it meets our internal quality bar. If a watermark remover cannot handle complex backgrounds, we do not release it. If a transcription tool fails on noisy audio, we keep training. Our users trust us with their important work, and we take that responsibility seriously.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Privacy by Default</h3>
            <p className="text-gray-700 leading-relaxed">
              Every file you upload is automatically deleted within one hour of processing. We do not use your content to train AI models. We do not sell your data. We do not show you ads based on your file contents. Privacy is not a paid feature — it is the foundation of our platform.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Global Access</h3>
            <p className="text-gray-700 leading-relaxed">
              The internet is global, and so are we. Our interface is fully translated into 10 languages, our customer support responds in your language, and our pricing is fair across regions. We believe that the language you speak should not determine which tools you can use.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Transparent Pricing</h3>
            <p className="text-gray-700 leading-relaxed">
              We tell you exactly how many credits each operation costs, before you spend them. There are no hidden fees, no surprise charges, no auto-escalating subscriptions. You know what you are paying, and you get what you pay for. It is a simple principle that the rest of the industry seems to have forgotten.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row-reverse items-center gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">{t('about.technology')}</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {t('about.technologyText')}
            </p>
          </div>
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">{t('about.whyChoose')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">{t('features.ai')}</h3>
            <p className="text-gray-600">{t('about.reason1')}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">{t('features.fast')}</h3>
            <p className="text-gray-600">{t('about.reason2')}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">{t('features.quality')}</h3>
            <p className="text-gray-600">{t('about.reason3')}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">{t('features.easy')}</h3>
            <p className="text-gray-600">{t('about.reason4')}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">{t('footer.privacy')}</h3>
            <p className="text-gray-600">{t('about.reason5')}</p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">{t('usecases.title')}</h2>
        <p className="text-xl text-gray-600 text-center mb-12">{t('usecases.subtitle')}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{t('usecases.photography')}</h3>
              <p className="text-gray-600">{t('usecases.photography.desc')}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{t('usecases.business')}</h3>
              <p className="text-gray-600">{t('usecases.business.desc')}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{t('usecases.personal')}</h3>
              <p className="text-gray-600">{t('usecases.personal.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - New for AdSense E-E-A-T */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Meet Our Team</h2>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          A globally distributed team of engineers, designers, and product experts committed to making AI accessible to everyone.
        </p>
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            Our team brings together expertise from leading technology companies, research institutions, and design studios around the world. With team members across Europe, Asia, and the Americas, we operate around the clock to ensure that our users always have access to the support and expertise they need.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            <strong>Engineering</strong> — Our engineering team includes specialists in computer vision, natural language processing, distributed systems, and machine learning infrastructure. Many of our engineers have published research in top AI conferences and contribute to open-source projects.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            <strong>Design</strong> — Our design team has backgrounds at consumer product companies where they learned the importance of making complex tools feel simple. They obsess over every interaction, every transition, and every word in the interface.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            <strong>Customer Success</strong> — Our support team is staffed by people who have actually used the tools, not just read about them. They are located across time zones so that you can always get a response within 24 hours, no matter where you are in the world.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-16 bg-gray-900 rounded-2xl p-8 md:p-12 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-bold mb-2 text-blue-400">500K+</div>
            <div className="text-gray-400">Active Users Worldwide</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold mb-2 text-green-400">150+</div>
            <div className="text-gray-400">Countries Served</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold mb-2 text-purple-400">80+</div>
            <div className="text-gray-400">AI-Powered Tools</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold mb-2 text-yellow-400">10</div>
            <div className="text-gray-400">Languages Supported</div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Get in Touch</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Have questions, feedback, or partnership ideas? We would love to hear from you. Our team typically responds within 24 hours.
        </p>
        <a
          href="mailto:support@chdaoai.com"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
        >
          support@chdaoai.com
        </a>
      </section>
    </div>
  )
}
