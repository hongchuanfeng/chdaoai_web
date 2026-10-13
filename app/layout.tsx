import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import CookieBanner from '@/components/CookieBanner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.chdaoai.com'),
  title: {
    default: 'ChDaoAI - 80+ AI-Powered Online Tools for Images, Videos, PDFs | Free to Try',
    template: '%s | ChDaoAI',
  },
  description: 'All-in-one AI tools platform: remove watermarks, remove image backgrounds, transcribe video to text, merge PDFs, translate subtitles, generate QR codes. 80+ professional tools, 10 languages, free to try.',
  keywords: 'AI tools, image tools, video tools, PDF tools, audio tools, subtitle tools, watermark remover, background remover, AI image generator, free online tools, chdaoai',
  authors: [{ name: 'ChDaoAI Team', url: 'https://www.chdaoai.com' }],
  creator: 'ChDaoAI',
  publisher: 'ChDaoAI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'zh': '/zh',
      'ru': '/ru',
      'ar': '/ar',
      'de': '/de',
      'ja': '/ja',
      'fr': '/fr',
      'es': '/es',
      'pt': '/pt',
      'ko': '/ko',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.chdaoai.com',
    siteName: 'ChDaoAI',
    title: 'ChDaoAI - 80+ AI-Powered Online Tools',
    description: 'All-in-one AI tools platform. Remove watermarks, remove backgrounds, transcribe video, merge PDFs, translate subtitles, generate QR codes. Free to try.',
    images: [
      {
        url: '/icon.svg',
        width: 1200,
        height: 630,
        alt: 'ChDaoAI - AI Tools Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChDaoAI - 80+ AI-Powered Online Tools',
    description: 'All-in-one AI tools platform. 80+ tools, 10 languages, free to try.',
    images: ['/icon.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  category: 'technology',
  classification: 'Business Tools',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Organization schema for E-E-A-T and rich results
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ChDaoAI',
    legalName: 'ChDaoAI',
    url: 'https://www.chdaoai.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.chdaoai.com/icon.svg',
      width: 512,
      height: 512,
    },
    description: 'ChDaoAI is a comprehensive AI tools platform serving 500,000+ users in 150+ countries with 80+ AI-powered tools for images, videos, audio, PDFs, and documents.',
    foundingDate: '2023',
    sameAs: [
      'https://twitter.com/chdaoai',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@chdaoai.com',
        availableLanguage: ['English', 'Chinese', 'Russian', 'Arabic', 'German', 'Japanese', 'French', 'Spanish', 'Portuguese', 'Korean'],
        areaServed: 'Worldwide',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CN',
    },
    knowsAbout: [
      'Artificial Intelligence',
      'Image Processing',
      'Video Processing',
      'Audio Processing',
      'PDF Processing',
      'Natural Language Processing',
      'Computer Vision',
      'Machine Learning',
    ],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ChDaoAI',
    url: 'https://www.chdaoai.com',
    description: 'All-in-one AI tools platform with 80+ professional tools',
    inLanguage: ['en', 'zh', 'ru', 'ar', 'de', 'ja', 'fr', 'es', 'pt', 'ko'],
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.chdaoai.com/en/blog?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ChDaoAI',
    },
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={inter.className}>
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-HBHVQCWZT5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HBHVQCWZT5');
          `}
        </Script>

        {/* Google AdSense */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7274710287377352"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />

        <main className="min-h-screen">
          {children}
        </main>
        <CookieBanner />
      </body>
    </html>
  )
}
