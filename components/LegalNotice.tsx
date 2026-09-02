'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function LegalNotice() {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">{t('legal.title')}</h1>
      <div className="prose max-w-none bg-white rounded-lg shadow-lg p-8">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('legal.company')}</h2>
          <p className="text-gray-700 mb-4">{t('legal.companyText')}</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>{t('legal.email')} support@chdaoai.com</li>
            <li>{t('legal.address')} 130 Building, Longhua Avenue, Longhua District, Shenzhen</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('legal.registration')}</h2>
          <p className="text-gray-700 mb-4">{t('legal.registrationText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('legal.jurisdiction')}</h2>
          <p className="text-gray-700 mb-4">{t('legal.jurisdictionText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('legal.content')}</h2>
          <p className="text-gray-700 mb-4">{t('legal.contentText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('legal.modifications')}</h2>
          <p className="text-gray-700 mb-4">{t('legal.modificationsText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('legal.liabilityLimit')}</h2>
          <p className="text-gray-700 mb-4">{t('legal.liabilityLimitText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('legal.dataProtection')}</h2>
          <p className="text-gray-700 mb-4">{t('legal.dataProtectionText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('legal.compliance')}</h2>
          <p className="text-gray-700 mb-4">{t('legal.complianceText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('legal.liability')}</h2>
          <p className="text-gray-700 mb-4">{t('legal.liabilityText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('legal.links')}</h2>
          <p className="text-gray-700 mb-4">{t('legal.linksText')}</p>
        </section>
      </div>
    </div>
  )
}
