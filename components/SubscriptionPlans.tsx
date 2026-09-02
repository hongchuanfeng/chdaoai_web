'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'

export default function SubscriptionPlans() {
  const { t } = useLanguage()
  const router = useRouter()

  const handleSubscribe = () => {
    router.push('/subscribe')
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('subscription.title') || 'Choose Your Plan'}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subscription.subtitle') || 'Unlock unlimited access to all AI-powered features with our flexible subscription plans'}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('subscription.basic.title') || 'Basic'}
              </h3>
              <div className="text-4xl font-bold text-primary-600 mb-1">
                ${t('subscription.basic.price') || '9.99'}
              </div>
              <p className="text-gray-600 mb-6">
                {t('subscription.basic.period') || '/month'}
              </p>

              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.basic.feature1') || '100 credits per month'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.basic.feature2') || 'All AI features'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.basic.feature3') || 'HD quality output'}</span>
                </li>
              </ul>

              <button
                onClick={handleSubscribe}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
              >
                {t('subscription.basic.button') || 'Choose Basic'}
              </button>
            </div>
          </div>

          {/* Pro Plan - Popular */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-primary-500 relative transform scale-105 hover:scale-110 transition-transform duration-300">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                {t('subscription.popular') || 'Most Popular'}
              </span>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('subscription.pro.title') || 'Pro'}
              </h3>
              <div className="text-4xl font-bold text-primary-600 mb-1">
                ${t('subscription.pro.price') || '19.99'}
              </div>
              <p className="text-gray-600 mb-6">
                {t('subscription.pro.period') || '/month'}
              </p>

              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.pro.feature1') || '500 credits per month'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.pro.feature2') || 'All AI features'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.pro.feature3') || '4K quality output'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.pro.feature4') || 'Priority processing'}</span>
                </li>
              </ul>

              <button
                onClick={handleSubscribe}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
              >
                {t('subscription.pro.button') || 'Choose Pro'}
              </button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('subscription.enterprise.title') || 'Enterprise'}
              </h3>
              <div className="text-4xl font-bold text-primary-600 mb-1">
                ${t('subscription.enterprise.price') || '49.99'}
              </div>
              <p className="text-gray-600 mb-6">
                {t('subscription.enterprise.period') || '/month'}
              </p>

              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.enterprise.feature1') || '2000 credits per month'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.enterprise.feature2') || 'All AI features'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.enterprise.feature3') || '8K quality output'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.enterprise.feature4') || 'API access'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.enterprise.feature5') || 'Dedicated support'}</span>
                </li>
              </ul>

              <button
                onClick={handleSubscribe}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
              >
                {t('subscription.enterprise.button') || 'Choose Enterprise'}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            {t('subscription.footer') || 'All plans include a 7-day free trial. Cancel anytime.'}
          </p>
          <button
            onClick={handleSubscribe}
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition-colors duration-200"
          >
            {t('subscription.view_details') || 'View All Plans & Details'}
          </button>
        </div>
      </div>
    </section>
  )
}
