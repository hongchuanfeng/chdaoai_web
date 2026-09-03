'use client'

import { useLanguage } from '@/contexts/LanguageContext'

interface PromotionBannerProps {
  lang: string
}

export default function PromotionBanner({ lang }: PromotionBannerProps) {
  const { t } = useLanguage()
  
  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
        <span className="text-lg sm:text-xl font-bold">🎁 {t('promo.banner')}</span>
        <a 
          href={`/${lang}/auth/register`} 
          className="bg-white text-green-600 px-5 py-1.5 rounded-full font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
        >
          {t('promo.signup')} →
        </a>
      </div>
    </div>
  )
}
