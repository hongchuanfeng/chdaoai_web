'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function Subscribe() {
  const { t } = useLanguage()

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('subscription.title') || 'Choose Your Plan'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subscription.subtitle') || 'Unlock unlimited access to all AI-powered features'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan - $10/month, 30 credits */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('subscription.basic.title') || 'Basic'}
              </h3>
              <div className="text-4xl font-bold text-primary-600 mb-1">
                ${t('subscription.basic.price') || '10'}
              </div>
              <p className="text-gray-600 mb-2">
                {t('subscription.basic.period') || '/month'}
              </p>
              <p className="text-lg font-semibold text-primary-600 mb-6">
                {t('subscription.basic.credits') || '30 credits'}
              </p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.basic.feature1') || '30 credits per month'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.basic.feature2') || 'All AI features'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.basic.feature3') || 'HD quality output'}</span>
                </li>
              </ul>
              <button className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700">
                {t('subscription.basic.button') || 'Choose Basic'}
              </button>
            </div>
          </div>

          {/* Pro Plan - $30/month, 100 credits */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-primary-500 relative">
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
                ${t('subscription.pro.price') || '30'}
              </div>
              <p className="text-gray-600 mb-2">
                {t('subscription.pro.period') || '/month'}
              </p>
              <p className="text-lg font-semibold text-primary-600 mb-6">
                {t('subscription.pro.credits') || '100 credits'}
              </p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.pro.feature1') || '100 credits per month'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.pro.feature2') || 'All AI features'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.pro.feature3') || '4K quality output'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.pro.feature4') || 'Priority processing'}</span>
                </li>
              </ul>
              <button className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700">
                {t('subscription.pro.button') || 'Choose Pro'}
              </button>
            </div>
          </div>

          {/* Enterprise Plan - $100/month, 350 credits */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t('subscription.enterprise.title') || 'Enterprise'}
              </h3>
              <div className="text-4xl font-bold text-primary-600 mb-1">
                ${t('subscription.enterprise.price') || '100'}
              </div>
              <p className="text-gray-600 mb-2">
                {t('subscription.enterprise.period') || '/month'}
              </p>
              <p className="text-lg font-semibold text-primary-600 mb-6">
                {t('subscription.enterprise.credits') || '350 credits'}
              </p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.enterprise.feature1') || '350 credits per month'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.enterprise.feature2') || 'All AI features'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.enterprise.feature3') || '8K quality output'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.enterprise.feature4') || 'API access'}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{t('subscription.enterprise.feature5') || 'Dedicated support'}</span>
                </li>
              </ul>
              <button className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700">
                {t('subscription.enterprise.button') || 'Choose Enterprise'}
              </button>
            </div>
          </div>
        </div>

        {/* Credit Usage Guide */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            {t('subscription.credits.title') || 'How Credits Work'}
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold">1</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('subscription.credits.what.title') || 'What are credits?'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {t('subscription.credits.what.desc') || 'Credits are the currency used to process images on our platform. Each image processing operation consumes credits based on the complexity of the task.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold">2</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('subscription.credits.usage.title') || 'How are credits used?'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {t('subscription.credits.usage.desc') || 'Each watermark removal or AI processing task uses 1-5 credits depending on the image size and complexity. Higher quality output requires more credits.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold">3</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('subscription.credits.unused.title') || 'What happens to unused credits?'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {t('subscription.credits.unused.desc') || 'Unused credits from your monthly subscription will expire at the end of each billing cycle and do not roll over to the next month.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold">4</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('subscription.credits.purchase.title') || 'Can I purchase additional credits?'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {t('subscription.credits.purchase.desc') || 'Yes, you can purchase additional credits at any time. Visit your profile page or contact support for more information on credit packages.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            {t('subscription.faq.title') || 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('subscription.faq.q1') || 'What are credits?'}
              </h3>
              <p className="text-gray-600">
                {t('subscription.faq.a1') || 'Credits are the currency used to process images on our platform. Each watermark removal operation consumes 1 credit. You can earn credits by subscribing to our plans or through special promotions.'}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('subscription.faq.q2') || 'Do I need to register to use RemoveWatermark to remove watermarks?'}
              </h3>
              <p className="text-gray-600">
                {t('subscription.faq.a2') || 'Yes, registration is required to use our service. This allows us to track your credits, save your processing history, and provide you with a better user experience.'}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('subscription.faq.q3') || 'Is RemoveWatermark free?'}
              </h3>
              <p className="text-gray-600">
                {t('subscription.faq.a3') || 'New users receive 5 free credits upon registration. After using these free credits, you can subscribe to one of our affordable plans to continue using the service.'}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('subscription.faq.q4') || 'Should I choose pay-as-you-go credits or a subscription plan?'}
              </h3>
              <p className="text-gray-600">
                {t('subscription.faq.a4') || 'Subscription plans offer better value with more credits per dollar. If you need to process images regularly, a subscription plan is recommended. Pay-as-you-go credits are ideal for occasional users.'}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('subscription.faq.q5') || 'What if I\'m not satisfied with the results?'}
              </h3>
              <p className="text-gray-600">
                {t('subscription.faq.a5') || 'We strive to provide high-quality results. If you\'re not satisfied, please contact our support team at support@chdaoai.com and we\'ll do our best to help you. However, credits used for processing cannot be refunded.'}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('subscription.faq.q6') || 'What if I run out of credit limit?'}
              </h3>
              <p className="text-gray-600">
                {t('subscription.faq.a6') || 'If you run out of credits, you can purchase additional credits or upgrade to a higher subscription plan. You can also wait for your monthly credits to reset if you\'re on a subscription plan.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
