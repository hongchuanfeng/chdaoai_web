'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState } from 'react'

interface VideoToolInfoProps {
  toolKey: string // e.g., 'video_watermark_removal', 'video_to_text', etc.
  exampleImages?: string[] // Optional custom example images for the tool
}

export default function VideoToolInfo({ toolKey, exampleImages }: VideoToolInfoProps) {
  const { t } = useLanguage()
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  // Default placeholder icons if no custom images provided
  const defaultIcons = ['🎬', '🎥', '📹']

  const features = [
    {
      icon: '🤖',
      title: t(`${toolKey}.features_ai`),
      description: t(`${toolKey}.features_ai_desc`),
    },
    {
      icon: '⚡',
      title: t(`${toolKey}.features_fast`),
      description: t(`${toolKey}.features_fast_desc`),
    },
    {
      icon: '✨',
      title: t(`${toolKey}.features_quality`),
      description: t(`${toolKey}.features_quality_desc`),
    },
    {
      icon: '🎯',
      title: t(`${toolKey}.features_custom`),
      description: t(`${toolKey}.features_custom_desc`),
    },
  ]

  const howToUse = [
    {
      number: '1',
      title: t(`${toolKey}.how_to_use_step1`),
      description: t(`${toolKey}.how_to_use_step1_desc`),
    },
    {
      number: '2',
      title: t(`${toolKey}.how_to_use_step2`),
      description: t(`${toolKey}.how_to_use_step2_desc`),
    },
    {
      number: '3',
      title: t(`${toolKey}.how_to_use_step3`),
      description: t(`${toolKey}.how_to_use_step3_desc`),
    },
    {
      number: '4',
      title: t(`${toolKey}.how_to_use_step4`),
      description: t(`${toolKey}.how_to_use_step4_desc`),
    },
  ]

  const faqs = [
    {
      question: t(`${toolKey}.faq_q1`),
      answer: t(`${toolKey}.faq_a1`),
    },
    {
      question: t(`${toolKey}.faq_q2`),
      answer: t(`${toolKey}.faq_a2`),
    },
    {
      question: t(`${toolKey}.faq_q3`),
      answer: t(`${toolKey}.faq_a3`),
    },
    {
      question: t(`${toolKey}.faq_q4`),
      answer: t(`${toolKey}.faq_a4`),
    },
    {
      question: t(`${toolKey}.faq_q5`),
      answer: t(`${toolKey}.faq_a5`),
    },
  ]

  return (
    <>
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t(`${toolKey}.features_title`)}
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
              {t(`${toolKey}.how_to_use_title`)}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howToUse.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
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

      {/* Examples Section */}
      <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t(`${toolKey}.examples_title`)}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t(`${toolKey}.examples_desc`)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map((index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48 bg-gray-200">
                  {exampleImages && exampleImages[index] ? (
                    <img
                      src={exampleImages[index]}
                      alt={`${t(`${toolKey}.example`)} ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center">
                      <span className="text-4xl">{defaultIcons[index]}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{t(`${toolKey}.example`)} {index + 1}</h3>
                  <p className="text-gray-600 text-sm mt-2">{t(`${toolKey}.example_desc${index + 1}`)}</p>
                </div>
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
              {t(`${toolKey}.faq_title`)}
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
                  <span className="text-blue-600">
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

