'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const { t } = useLanguage()
  const router = useRouter()

  return (
    <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-primary-100">
            {t('hero.subtitle')}
          </p>
          <p className="text-lg md:text-xl mb-8 text-primary-200 max-w-3xl mx-auto">
            {t('hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.push('/remove-watermark')}
              className="bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-400 transition shadow-lg"
            >
              {t('hero.cta')}
            </button>
            <button
              onClick={() => router.push('/subscribe')}
              className="bg-white/20 backdrop-blur-sm text-white border-2 border-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/30 transition shadow-lg"
            >
              {t('hero.subscribe')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
