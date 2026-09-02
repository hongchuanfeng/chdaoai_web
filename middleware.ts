import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'zh', 'ru', 'ar', 'de', 'ja', 'fr', 'es', 'pt', 'ko']
const defaultLocale = 'en'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 排除所有静态资源、API和其他特殊路径 - 放在最前面
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/image') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/icon.svg'
  ) {
    return NextResponse.next()
  }

  // 获取路径的第一个部分作为语言代码
  const pathnameLocale = pathname.split('/')[1]
  const query = request.nextUrl.search

  // 如果是auth路径，有语言前缀的直接通过，没有语言前缀的重定向到带语言前缀的路径
  if (pathname.includes('/auth/')) {
    if (pathnameLocale && locales.includes(pathnameLocale)) {
      return NextResponse.next()
    } else {
      // 没有语言前缀，需要重定向到带语言前缀的路径
      // 优先从cookie获取用户偏好语言
      let locale = request.cookies.get('language')?.value
      if (!locale) {
        const acceptLanguage = request.headers.get('Accept-Language')
        if (acceptLanguage) {
          const preferredLocale = acceptLanguage.split(',')[0].split('-')[0]
          if (locales.includes(preferredLocale)) {
            locale = preferredLocale
          }
        }
      }
      if (!locale || !locales.includes(locale)) {
        locale = defaultLocale
      }
      const authPath = `/${locale}${pathname}`
      return NextResponse.redirect(new URL(`${authPath}${query}`, request.url))
    }
  }

  // 检查路径是否已经有有效的语言前缀
  const isValidLocale = locales.includes(pathnameLocale)
  
  // 如果路径已经有语言前缀且不是auth路径，直接通过
  if (isValidLocale && !pathname.includes('/auth/')) {
    return NextResponse.next()
  }

  // 路径没有语言前缀，需要重定向到默认语言
  // 优先从cookie获取用户偏好语言
  let locale = request.cookies.get('language')?.value

  // 如果没有cookie，尝试从Accept-Language header获取
  if (!locale) {
    const acceptLanguage = request.headers.get('Accept-Language')
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage.split(',')[0].split('-')[0]
      if (locales.includes(preferredLocale)) {
        locale = preferredLocale
      }
    }
  }

  // 如果没有找到有效的偏好语言，使用默认语言
  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale
  }

  // 构建新的URL并重定向
  const newPath = pathname === '/'
    ? `/${locale}`
    : `/${locale}${pathname}`

  return NextResponse.redirect(new URL(`${newPath}${query}`, request.url))
}

export const config = {
  matcher: [
    '/',
    '/:path*',
  ],
}
