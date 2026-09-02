'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function TermsOfService() {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">{t('terms.title')}</h1>
      <div className="prose max-w-none bg-white rounded-lg shadow-lg p-8">
        <p className="text-gray-600 mb-6">{t('terms.lastUpdated')} {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('terms.acceptance')}</h2>
          <p className="text-gray-700 mb-4">{t('terms.acceptanceText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('terms.serviceDesc')}</h2>
          <p className="text-gray-700 mb-4">{t('terms.serviceDescText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('terms.subscription')}</h2>
          <p className="text-gray-700 mb-4">{t('terms.subscriptionText')}</p>
          <p className="text-gray-700 mb-2 font-semibold">{t('terms.subscriptionDetails')}</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>{t('terms.subscription1')}</li>
            <li>{t('terms.subscription2')}</li>
            <li>{t('terms.subscription3')}</li>
            <li>{t('terms.subscription4')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('terms.accounts')}</h2>
          <p className="text-gray-700 mb-4">{t('terms.accountsText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('terms.ip')}</h2>
          <p className="text-gray-700 mb-4">{t('terms.ipText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('terms.prohibited')}</h2>
          <p className="text-gray-700 mb-4">{t('terms.prohibitedText')}</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>{t('terms.prohibited1')}</li>
            <li>{t('terms.prohibited2')}</li>
            <li>{t('terms.prohibited3')}</li>
            <li>{t('terms.prohibited4')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('terms.serviceChanges')}</h2>
          <p className="text-gray-700 mb-4">{t('terms.serviceChangesText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('terms.termination')}</h2>
          <p className="text-gray-700 mb-4">{t('terms.terminationText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('terms.contact')}</h2>
          <p className="text-gray-700 mb-4">{t('terms.contactText')}</p>
        </section>
      </div>
    </div>
  )
}
