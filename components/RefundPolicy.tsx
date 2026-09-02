'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function RefundPolicy() {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">{t('refund.title')}</h1>
      <div className="prose max-w-none bg-white rounded-lg shadow-lg p-8">
        <p className="text-gray-600 mb-6">{t('refund.lastUpdated')} {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('refund.eligibility')}</h2>
          <p className="text-gray-700 mb-4">{t('refund.eligibilityText')}</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>{t('refund.eligibility1')}</li>
            <li>{t('refund.eligibility2')}</li>
            <li>{t('refund.eligibility3')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('refund.conditions')}</h2>
          <p className="text-gray-700 mb-4">{t('refund.conditionsText')}</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>{t('refund.conditions1')}</li>
            <li>{t('refund.conditions2')}</li>
            <li>{t('refund.conditions3')}</li>
            <li>{t('refund.conditions4')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('refund.partial')}</h2>
          <p className="text-gray-700 mb-4">{t('refund.partialText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('refund.howTo')}</h2>
          <p className="text-gray-700 mb-4">
            {t('refund.howToText')} <a href="mailto:support@chdaoai.com" className="text-primary-600 hover:underline">support@chdaoai.com</a> {t('refund.howToText2')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('refund.method')}</h2>
          <p className="text-gray-700 mb-4">{t('refund.methodText')}</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>{t('refund.method1')}</li>
            <li>{t('refund.method2')}</li>
            <li>{t('refund.method3')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('refund.processing')}</h2>
          <p className="text-gray-700 mb-4">{t('refund.processingText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('refund.nonRefundable')}</h2>
          <p className="text-gray-700 mb-4">{t('refund.nonRefundableText')}</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>{t('refund.nonRefundable1')}</li>
            <li>{t('refund.nonRefundable2')}</li>
            <li>{t('refund.nonRefundable3')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('refund.contact')}</h2>
          <p className="text-gray-700 mb-4">
            {t('refund.contactText')} <a href="mailto:support@chdaoai.com" className="text-primary-600 hover:underline">support@chdaoai.com</a>
          </p>
        </section>
      </div>
    </div>
  )
}
