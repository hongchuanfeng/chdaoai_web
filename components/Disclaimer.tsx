'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function Disclaimer() {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">{t('disclaimer.title')}</h1>
      <div className="prose max-w-none bg-white rounded-lg shadow-lg p-8">
        <p className="text-gray-600 mb-6">{t('disclaimer.lastUpdated')} {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('disclaimer.service')}</h2>
          <p className="text-gray-700 mb-4">{t('disclaimer.serviceText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('disclaimer.legalUse')}</h2>
          <p className="text-gray-700 mb-4">{t('disclaimer.legalUseText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('disclaimer.copyright')}</h2>
          <p className="text-gray-700 mb-4">{t('disclaimer.copyrightText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('disclaimer.liability')}</h2>
          <p className="text-gray-700 mb-4">{t('disclaimer.liabilityText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('disclaimer.availability')}</h2>
          <p className="text-gray-700 mb-4">{t('disclaimer.availabilityText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('disclaimer.accuracy')}</h2>
          <p className="text-gray-700 mb-4">{t('disclaimer.accuracyText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('disclaimer.thirdParty')}</h2>
          <p className="text-gray-700 mb-4">{t('disclaimer.thirdPartyText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('disclaimer.technical')}</h2>
          <p className="text-gray-700 mb-4">{t('disclaimer.technicalText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('disclaimer.userContent')}</h2>
          <p className="text-gray-700 mb-4">{t('disclaimer.userContentText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('disclaimer.medical')}</h2>
          <p className="text-gray-700 mb-4">{t('disclaimer.medicalText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('disclaimer.force')}</h2>
          <p className="text-gray-700 mb-4">{t('disclaimer.forceText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('disclaimer.contact')}</h2>
          <p className="text-gray-700 mb-4">
            {t('disclaimer.contactText')} <a href="mailto:support@chdaoai.com" className="text-primary-600 hover:underline">support@chdaoai.com</a>
          </p>
        </section>
      </div>
    </div>
  )
}
