'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// 导入各语言翻译
import enTranslations from './languages/en'
import zhTranslations from './languages/zh'
import ruTranslations from './languages/ru'
import arTranslations from './languages/ar'
import deTranslations from './languages/de'
import jaTranslations from './languages/ja'
import frTranslations from './languages/fr'
import esTranslations from './languages/es'
import ptTranslations from './languages/pt'
import koTranslations from './languages/ko'

export type Language = 'en' | 'zh' | 'ru' | 'ar' | 'de' | 'ja' | 'fr' | 'es' | 'pt' | 'ko'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, number | string>) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: enTranslations,
  zh: zhTranslations,
  ru: ruTranslations,
  ar: arTranslations,
  de: deTranslations,
  ja: jaTranslations,
  fr: frTranslations,
  es: esTranslations,
  pt: ptTranslations,
  ko: koTranslations,
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children, lang = 'en' }: { children: React.ReactNode; lang?: Language }) {
  const [language, setLanguage] = useState<Language>(lang)

  const t = (key: string, params?: Record<string, number | string>): string => {
    let text = translations[language]?.[key] || translations.en?.[key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v))
      })
    }
    return text
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}