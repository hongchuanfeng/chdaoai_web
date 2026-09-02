'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState } from 'react'

export default function AIAgeChangeInfo() {
  const { t } = useLanguage()
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const features = [
    {
      icon: '🤖',
      title: t('ai_age_change.features_ai'),
      description: t('ai_age_change.features_ai_desc'),
    },
    {
      icon: '⚡',
      title: t('ai_age_change.features_fast'),
      description: t('ai_age_change.features_fast_desc'),
    },
    {
      icon: '✨',
      title: t('ai_age_change.features_quality'),
      description: t('ai_age_change.features_quality_desc'),
    },
    {
      icon: '🎯',
      title: t('ai_age_change.features_custom'),
      description: t('ai_age_change.features_custom_desc'),
    },
  ]

  const howToUse = [
    {
      number: '1',
      title: t('ai_age_change.how_to_use_step1'),
      description: t('ai_age_change.how_to_use_step1_desc'),
    },
    {
      number: '2',
      title: t('ai_age_change.how_to_use_step2'),
      description: t('ai_age_change.how_to_use_step2_desc'),
    },
    {
      number: '3',
      title: t('ai_age_change.how_to_use_step3'),
      description: t('ai_age_change.how_to_use_step3_desc'),
    },
    {
      number: '4',
      title: t('ai_age_change.how_to_use_step4'),
      description: t('ai_age_change.how_to_use_step4_desc'),
    },
  ]

  const faqs = [
    {
      question: t('ai_age_change.faq_q1'),
      answer: t('ai_age_change.faq_a1'),
    },
    {
      question: t('ai_age_change.faq_q2'),
      answer: t('ai_age_change.faq_a2'),
    },
    {
      question: t('ai_age_change.faq_q3'),
      answer: t('ai_age_change.faq_a3'),
    },
    {
      question: t('ai_age_change.faq_q4'),
      answer: t('ai_age_change.faq_a4'),
    },
    {
      question: t('ai_age_change.faq_q5'),
      answer: t('ai_age_change.faq_a5'),
    },
  ]

  return (
    <>
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('ai_age_change.features_title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('ai_age_change.how_to_use_title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howToUse.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('ai_age_change.faq_title')}
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <span className="text-purple-600">
                    {openFaqIndex === index ? '−' : '+'}
                  </span>
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 py-4 bg-white text-gray-700">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

