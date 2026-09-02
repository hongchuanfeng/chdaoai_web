'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'

export default function CTA() {
  const { t, language } = useLanguage()

  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {t('cta.title')}
        </h2>
        <p className="text-xl mb-8 text-primary-100">
          {t('cta.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${language}/remove-watermark`}
            className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition shadow-lg inline-block"
          >
            {t('hero.cta')}
          </Link>
          <Link
            href={`/${language}/subscribe`}
            className="bg-primary-500 text-white border-2 border-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-400 transition shadow-lg inline-block"
          >
            {t('cta.subscribe')}
          </Link>
        </div>
      </div>
    </section>
  )
}
