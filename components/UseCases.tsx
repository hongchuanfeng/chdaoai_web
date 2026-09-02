'use client'

import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

export default function UseCases() {
  const { t } = useLanguage()

  const examples = [
    { id: 1, before: '/image/b1.png', after: '/image/a1.png', typeKey: 'usecases.examples.logo' },
    { id: 2, before: '/image/b2.png', after: '/image/a2.png', typeKey: 'usecases.examples.watermark' },
    { id: 3, before: '/image/b3.png', after: '/image/a3.png', typeKey: 'usecases.examples.logoWatermark' },
    { id: 4, before: '/image/b4.png', after: '/image/a4.png', typeKey: 'usecases.examples.logoWatermark' },
    { id: 5, before: '/image/b5.png', after: '/image/a5.png', typeKey: 'usecases.examples.logoWatermark' },
    { id: 6, before: '/image/b6.png', after: '/image/a6.png', typeKey: 'usecases.examples.logoWatermark' },
    { id: 7, before: '/image/b7.png', after: '/image/a7.png', typeKey: 'usecases.examples.logoWatermark' },
    { id: 8, before: '/image/b8.png', after: '/image/a8.png', typeKey: 'usecases.examples.logoWatermark' },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('usecases.title')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('usecases.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">{t('usecases.photography')}</h3>
            <p className="text-gray-600">
              {t('usecases.photography.desc')}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">{t('usecases.business')}</h3>
            <p className="text-gray-600">
              {t('usecases.business.desc')}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">{t('usecases.personal')}</h3>
            <p className="text-gray-600">
              {t('usecases.personal.desc')}
            </p>
          </div>
        </div>

        <div className="mb-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {t('usecases.examples.title')}
          </h3>
          <p className="text-gray-600 text-sm">
            {t('usecases.examples.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {examples.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-primary-600">
                  {t('usecases.examples.sample')} {item.id} · {t(item.typeKey as any)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {t('usecases.examples.before')}
                  </div>
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
                    <Image
                      src={item.before}
                      alt={`Before example ${item.id}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {t('usecases.examples.after')}
                  </div>
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
                    <Image
                      src={item.after}
                      alt={`After example ${item.id}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
