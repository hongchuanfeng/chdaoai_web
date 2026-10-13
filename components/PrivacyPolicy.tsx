'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function PrivacyPolicy() {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">{t('privacy.title')}</h1>
      <div className="prose max-w-none bg-white rounded-lg shadow-lg p-8">
        <p className="text-gray-600 mb-6">{t('privacy.lastUpdated')} {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('privacy.intro')}</h2>
          <p className="text-gray-700 mb-4">{t('privacy.introText')}</p>
          <p className="text-gray-700 mb-4">
            At ChDaoAI, we believe that privacy is a fundamental right. This Privacy Policy explains in plain language what data we collect, why we collect it, how we use it, and what choices you have. We have written this policy to be transparent, not to bury important information in legal jargon. If anything is unclear, please contact us at support@chdaoai.com and we will be happy to clarify.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('privacy.collect')}</h2>
          <p className="text-gray-700 mb-4">{t('privacy.collectText')}</p>
          <p className="text-gray-700 mb-4">The categories of data we collect include:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Account information</strong>: When you create an account, we collect your email address, name (if provided), and password (stored as a one-way hash). If you sign in with Google or another OAuth provider, we receive your name, email, and profile picture from that provider.</li>
            <li><strong>Usage data</strong>: We automatically collect information about how you interact with our platform, including pages visited, features used, and actions taken. This helps us understand which tools are most popular and where we can improve.</li>
            <li><strong>Device and connection data</strong>: We collect your IP address, browser type, device type, operating system, and referring URL. This data helps us deliver our service securely and optimize it for different devices.</li>
            <li><strong>Payment data</strong>: When you make a purchase, our payment processor (Creem) collects your payment information. We do not see or store your full credit card number, bank account, or other sensitive payment details.</li>
            <li><strong>Communications</strong>: If you contact us via email, contact form, or chat, we retain those communications to help you and improve our service.</li>
            <li><strong>Files you upload</strong>: When you use our tools, you upload files for processing. We process these files to provide our service and automatically delete them within one hour. We do not use your files to train AI models.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('privacy.use')}</h2>
          <p className="text-gray-700 mb-4">{t('privacy.useText')}</p>
          <p className="text-gray-700 mb-4">We use the data we collect for the following purposes:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Service delivery</strong>: To provide, operate, and maintain our tools and platform.</li>
            <li><strong>Account management</strong>: To create and manage your account, authenticate you, and provide customer support.</li>
            <li><strong>Payment processing</strong>: To process subscription payments and prevent fraud.</li>
            <li><strong>Improvement</strong>: To understand how our tools are used and identify opportunities to improve features, performance, and user experience.</li>
            <li><strong>Communications</strong>: To send you transactional emails (account verification, payment confirmations, security alerts) and, with your consent, marketing communications about new features and offers.</li>
            <li><strong>Legal compliance</strong>: To comply with applicable laws, regulations, and legal processes.</li>
            <li><strong>Security</strong>: To detect and prevent fraud, abuse, security incidents, and other harmful activities.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('privacy.security')}</h2>
          <p className="text-gray-700 mb-4">{t('privacy.securityText')}</p>
          <p className="text-gray-700 mb-4">
            We implement industry-standard security measures to protect your data. All data is transmitted over HTTPS using TLS 1.2 or higher. Sensitive data is encrypted at rest. Access to production systems is restricted to authorized personnel with multi-factor authentication. We conduct regular security audits and penetration tests. Despite our efforts, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('privacy.retention')}</h2>
          <p className="text-gray-700 mb-4">{t('privacy.retentionText')}</p>
          <p className="text-gray-700 mb-4">
            We retain different categories of data for different periods: files you upload are automatically deleted within one hour of processing; account data is retained while your account is active; usage data is retained for up to 26 months for analytics; payment records are retained for 7 years for tax and legal compliance. You can request deletion of your account and associated data at any time by contacting support@chdaoai.com.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('privacy.rights')}</h2>
          <p className="text-gray-700 mb-4">{t('privacy.rightsText')}</p>
          <p className="text-gray-700 mb-4">You have the following rights regarding your data:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Access</strong>: You can request a copy of the personal data we hold about you.</li>
            <li><strong>Rectification</strong>: You can request correction of inaccurate or incomplete data.</li>
            <li><strong>Erasure</strong>: You can request deletion of your personal data, subject to legal retention requirements.</li>
            <li><strong>Restriction</strong>: You can request that we restrict the processing of your data in certain circumstances.</li>
            <li><strong>Portability</strong>: You can request a machine-readable copy of your data for transfer to another service.</li>
            <li><strong>Objection</strong>: You can object to processing based on legitimate interest or for direct marketing purposes.</li>
            <li><strong>Withdraw consent</strong>: Where processing is based on consent, you can withdraw that consent at any time.</li>
            <li><strong>Lodge a complaint</strong>: You can lodge a complaint with a data protection authority in your jurisdiction.</li>
          </ul>
          <p className="text-gray-700 mt-4">
            To exercise any of these rights, please contact us at support@chdaoai.com. We will respond within 30 days.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Advertising and Cookies</h2>
          <p className="text-gray-700 mb-4">
            We use Google AdSense to display advertisements on our free-tier pages. Google AdSense uses cookies to serve ads based on your prior visits to our website and other websites on the internet. Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the internet.
          </p>
          <p className="text-gray-700 mb-4">
            You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-blue-600 hover:underline" rel="noopener noreferrer">Google Ads Settings</a>. You may also opt out of certain third-party vendors&apos; use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" className="text-blue-600 hover:underline" rel="noopener noreferrer">www.aboutads.info</a>.
          </p>
          <p className="text-gray-700 mb-4">
            For more information about how Google uses data from partner sites, visit <a href="https://policies.google.com/technologies/partner-sites" className="text-blue-600 hover:underline" rel="noopener noreferrer">How Google uses data when you use our partners&apos; sites or apps</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">International Data Transfers</h2>
          <p className="text-gray-700 mb-4">
            ChDaoAI is a global platform, and your data may be transferred to and processed in countries other than your own. These countries may have data protection laws that differ from your home country. We rely on standard contractual clauses and other appropriate safeguards to ensure your data remains protected during international transfers, in accordance with GDPR, CCPA, and other applicable data protection regulations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Children&apos;s Privacy</h2>
          <p className="text-gray-700 mb-4">
            Our services are not directed to children under 13 years of age, and we do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13 without verification of parental consent, we will delete that information promptly. If you believe we have collected information from a child under 13, please contact us at support@chdaoai.com.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('privacy.contact')}</h2>
          <p className="text-gray-700 mb-4">{t('privacy.contactText')}</p>
          <p className="text-gray-700 mb-4">
            For any privacy-related questions or to exercise your data rights, please contact our Data Protection Officer at:
            <br /><br />
            <strong>Email:</strong> support@chdaoai.com<br />
            <strong>Subject line:</strong> Privacy Request<br />
            <br />
            We will respond to your request within 30 days. If you are not satisfied with our response, you have the right to lodge a complaint with your local data protection authority.
          </p>
        </section>
      </div>
    </div>
  )
}
