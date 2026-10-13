'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function CookiePolicy() {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
        {t('cookiePolicy.title') || 'Cookie Policy'}
      </h1>
      <div className="prose max-w-none bg-white rounded-lg shadow-lg p-8">
        <p className="text-gray-600 mb-6">
          {t('cookiePolicy.lastUpdated') || 'Last updated'}: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            {t('cookiePolicy.intro') || 'What Are Cookies'}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('cookiePolicy.introText') ||
              'Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners. This policy explains how ChDaoAI uses cookies and similar technologies.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            {t('cookiePolicy.types') || 'Types of Cookies We Use'}
          </h2>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">
            {t('cookiePolicy.essential') || 'Essential Cookies'}
          </h3>
          <p className="text-gray-700 mb-4">
            {t('cookiePolicy.essentialText') ||
              'These cookies are necessary for the website to function properly. They enable basic features such as page navigation, secure areas access, and remembering your preferences (such as language). The website cannot function without these cookies.'}
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
            <li>Session cookies (expire when you close your browser)</li>
            <li>Authentication cookies (keep you signed in)</li>
            <li>Security cookies (protect against fraud)</li>
            <li>Language preference cookies (remember your chosen language)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">
            {t('cookiePolicy.analytics') || 'Analytics Cookies'}
          </h3>
          <p className="text-gray-700 mb-4">
            {t('cookiePolicy.analyticsText') ||
              'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website based on user behavior.'}
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
            <li>Google Analytics cookies (track page views, session duration)</li>
            <li>Performance monitoring cookies</li>
            <li>Error tracking cookies</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">
            {t('cookiePolicy.advertising') || 'Advertising Cookies'}
          </h3>
          <p className="text-gray-700 mb-4">
            {t('cookiePolicy.advertisingText') ||
              'These cookies are used to deliver advertisements that are relevant to you and your interests. They are also used to limit the number of times you see an advertisement and to help measure the effectiveness of advertising campaigns.'}
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
            <li>Google AdSense cookies</li>
            <li>Third-party advertising cookies</li>
            <li>Retargeting cookies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            {t('cookiePolicy.thirdParty') || 'Third-Party Cookies'}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('cookiePolicy.thirdPartyText') ||
              'Some cookies on our website are placed by third-party services that appear on our pages. We do not control the setting of these cookies, so we suggest you check the third-party websites for more information about their cookies and how to manage them.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            {t('cookiePolicy.duration') || 'Cookie Duration'}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('cookiePolicy.durationText') ||
              'Cookies can be either "session" cookies (deleted when you close your browser) or "persistent" cookies (remain on your device until they expire or you delete them). Most cookies we use are persistent to provide a consistent experience across visits.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            {t('cookiePolicy.manage') || 'Managing Cookies'}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('cookiePolicy.manageText') ||
              'Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or to indicate when a cookie is being sent. Please note that if you choose to disable cookies, some parts of our website may not function properly.'}
          </p>
          <p className="text-gray-700 mb-4">
            For more information about how to manage cookies, visit your browser&apos;s help pages:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
            <li><a href="https://support.google.com/chrome/answer/95647" className="text-blue-600 hover:underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" className="text-blue-600 hover:underline">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-blue-600 hover:underline">Apple Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-blue-600 hover:underline">Microsoft Edge</a></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            {t('cookiePolicy.changes') || 'Changes to This Policy'}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('cookiePolicy.changesText') ||
              'We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website with a revised "last updated" date.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            {t('cookiePolicy.contact') || 'Contact Us'}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('cookiePolicy.contactText') ||
              'If you have any questions about our use of cookies, please contact us at support@chdaoai.com.'}
          </p>
        </section>
      </div>
    </div>
  )
}
