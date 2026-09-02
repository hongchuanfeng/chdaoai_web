'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

// 辅助函数：获取带语言前缀的路径
const getLangPath = (path: string, lang: string): string => {
  if (path === '/') return `/${lang}`
  return `/${lang}${path}`
}

export default function Footer() {
  const { t, language } = useLanguage()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">chdaoai</h3>
            <p className="text-sm">
              Professional AI-powered watermark and logo removal service.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={getLangPath('/privacy-policy', language)} className="hover:text-white transition">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href={getLangPath('/terms-of-service', language)} className="hover:text-white transition">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href={getLangPath('/refund-policy', language)} className="hover:text-white transition">
                  {t('footer.refund')}
                </Link>
              </li>
              <li>
                <Link href={getLangPath('/disclaimer', language)} className="hover:text-white transition">
                  {t('footer.disclaimer')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">More</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={getLangPath('/copyright', language)} className="hover:text-white transition">
                  {t('footer.copyright')}
                </Link>
              </li>
              <li>
                <Link href={getLangPath('/legal-notice', language)} className="hover:text-white transition">
                  {t('footer.legal')}
                </Link>
              </li>
              <li>
                <Link href={getLangPath('/intellectual-property', language)} className="hover:text-white transition">
                  {t('footer.ip')}
                </Link>
              </li>
              <li>
                <Link href={getLangPath('/contact', language)} className="hover:text-white transition">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="font-medium">{t('footer.email')}:</span>{' '}
                <a href="mailto:support@chdaoai.com" className="hover:text-white transition">
                  support@chdaoai.com
                </a>
              </li>
              <li>
                <span className="font-medium">{t('footer.address')}:</span>{' '}
                {t('footer.address.value')}
              </li>
              <li>
                <Link href={getLangPath('/about', language)} className="hover:text-white transition">
                  {t('nav.about')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.friendship') || 'Friendship Links'}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://mosaic.openai2025.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  {t('footer.friendship.link1')}
                </a>
              </li>
              <li>
                <a href="https://www.icebreakgame.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  {t('footer.friendship.link2')}
                </a>
              </li>
              <li>
                <a href="https://www.removewatermarker.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  {t('footer.friendship.link3')}
                </a>
              </li>
              <li>
                <a href="https://pdf.chdaoai.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  {t('footer.friendship.link4')}
                </a>
              </li>
              <li>
                <a href="https://qrcode.chdaoai.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  {t('footer.friendship.link5')}
                </a>
              </li>
              <li>
                <a href="https://www.zorezoro.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  {t('footer.friendship.link6')}
                </a>
              </li>
              <li>
                <a href="https://video2txt.zorezoro.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  {t('footer.friendship.link7')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} chdaoai. All rights reserved.</p>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition mt-2 inline-block"
          >
            粤ICP备2026028564号-2
          </a>
        </div>
      </div>
    </footer>
  )
}
