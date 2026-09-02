'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function Copyright() {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">{t('copyright.title')}</h1>
      <div className="prose max-w-none bg-white rounded-lg shadow-lg p-8">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('copyright.ownership')}</h2>
          <p className="text-gray-700 mb-4">{t('copyright.ownershipText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('copyright.userContent')}</h2>
          <p className="text-gray-700 mb-4">{t('copyright.userContentText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('copyright.prohibited')}</h2>
          <p className="text-gray-700 mb-4">{t('copyright.prohibitedText')}</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>{t('copyright.prohibited1')}</li>
            <li>{t('copyright.prohibited2')}</li>
            <li>{t('copyright.prohibited3')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('copyright.dmca')}</h2>
          <p className="text-gray-700 mb-4">{t('copyright.dmcaText')} support@chdaoai.com {t('copyright.dmcaText2')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('copyright.license')}</h2>
          <p className="text-gray-700 mb-4">{t('copyright.licenseText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('copyright.fairUse')}</h2>
          <p className="text-gray-700 mb-4">{t('copyright.fairUseText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('copyright.enforcement')}</h2>
          <p className="text-gray-700 mb-4">{t('copyright.enforcementText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('copyright.attribution')}</h2>
          <p className="text-gray-700 mb-4">{t('copyright.attributionText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('copyright.international')}</h2>
          <p className="text-gray-700 mb-4">{t('copyright.internationalText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('copyright.contact')}</h2>
          <p className="text-gray-700 mb-4">{t('copyright.contactText')} support@chdaoai.com</p>
        </section>
      </div>
    </div>
  )
}
