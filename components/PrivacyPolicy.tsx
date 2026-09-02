'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function PrivacyPolicy() {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">{t('privacy.title')}</h1>
      <div className="prose max-w-none bg-white rounded-lg shadow-lg p-8">
        <p className="text-gray-600 mb-6">{t('privacy.lastUpdated')} {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('privacy.intro')}</h2>
          <p className="text-gray-700 mb-4">{t('privacy.introText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('privacy.collect')}</h2>
          <p className="text-gray-700 mb-4">{t('privacy.collectText')}</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>{t('privacy.collect1')}</li>
            <li>{t('privacy.collect2')}</li>
            <li>{t('privacy.collect3')}</li>
            <li>{t('privacy.collect4')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('privacy.use')}</h2>
          <p className="text-gray-700 mb-4">{t('privacy.useText')}</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>{t('privacy.use1')}</li>
            <li>{t('privacy.use2')}</li>
            <li>{t('privacy.use3')}</li>
            <li>{t('privacy.use4')}</li>
            <li>{t('privacy.use5')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('privacy.security')}</h2>
          <p className="text-gray-700 mb-4">{t('privacy.securityText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('privacy.retention')}</h2>
          <p className="text-gray-700 mb-4">{t('privacy.retentionText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('privacy.rights')}</h2>
          <p className="text-gray-700 mb-4">{t('privacy.rightsText')}</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>{t('privacy.rights1')}</li>
            <li>{t('privacy.rights2')}</li>
            <li>{t('privacy.rights3')}</li>
            <li>{t('privacy.rights4')}</li>
            <li>{t('privacy.rights5')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('privacy.contact')}</h2>
          <p className="text-gray-700 mb-4">{t('privacy.contactText')}</p>
        </section>
      </div>
    </div>
  )
}
