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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-white text-lg font-semibold mb-4">chdaoai</h3>
            <p className="text-sm mb-4">
              {language === 'zh'
                ? 'ChDaoAI 是面向创作者、企业和专业人士的综合AI工具平台。80多种专业工具，10种语言，服务全球150多个国家。'
                : 'ChDaoAI is a comprehensive AI tools platform for creators, businesses, and professionals. 80+ specialized tools, 10 languages, serving 150+ countries worldwide.'}
            </p>
            <p className="text-xs text-gray-400">
              {language === 'zh'
                ? '专业品质AI工具，免费开始。'
                : 'Professional-grade AI tools, free to start.'}
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{language === 'zh' ? '工具' : 'Tools'}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={getLangPath('/tools', language)} className="hover:text-white transition">
                  {language === 'zh' ? '所有工具' : 'All Tools'}
                </Link>
              </li>
              <li>
                <Link href={getLangPath('/remove-watermark', language)} className="hover:text-white transition">
                  {t('nav.image_watermark_removal')}
                </Link>
              </li>
              <li>
                <Link href={getLangPath('/ai-remove-background', language)} className="hover:text-white transition">
                  {t('nav.ai_remove_background')}
                </Link>
              </li>
              <li>
                <Link href={getLangPath('/image-compress', language)} className="hover:text-white transition">
                  {t('nav.image_compress')}
                </Link>
              </li>
              <li>
                <Link href={getLangPath('/pdf-merge', language)} className="hover:text-white transition">
                  {t('nav.pdf_merge')}
                </Link>
              </li>
              <li>
                <Link href={getLangPath('/video-to-text', language)} className="hover:text-white transition">
                  {t('nav.video_to_text')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{language === 'zh' ? '资源' : 'Resources'}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={getLangPath('/blog', language)} className="hover:text-white transition">
                  {language === 'zh' ? '博客' : 'Blog'}
                </Link>
              </li>
              <li>
                <Link href={getLangPath('/guides', language)} className="hover:text-white transition">
                  {language === 'zh' ? '使用指南' : 'Guides'}
                </Link>
              </li>
              <li>
                <Link href={getLangPath('/about', language)} className="hover:text-white transition">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link href={getLangPath('/contact', language)} className="hover:text-white transition">
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link href={getLangPath('/subscribe', language)} className="hover:text-white transition">
                  {t('nav.subscribe')}
                </Link>
              </li>
            </ul>
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
              <li>
                <Link href={getLangPath('/copyright', language)} className="hover:text-white transition">
                  {t('footer.copyright')}
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
                <Link href={getLangPath('/contact', language)} className="hover:text-white transition">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <span className="font-medium">{language === 'zh' ? '支持' : 'Support'}:</span>{' '}
                {language === 'zh' ? '24小时内响应' : '24h response'}
              </li>
              <li>
                <span className="font-medium">{language === 'zh' ? '语言' : 'Languages'}:</span>{' '}
                10
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ChDaoAI. {language === 'zh' ? '版权所有。' : 'All rights reserved.'}</p>
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
