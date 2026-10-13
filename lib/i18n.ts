// Safe localization helpers to prevent runtime crashes when
// a translation key is missing for the requested language.
//
// Many content types in /lib only ship `en` and `zh` translations.
// This helper falls back to English (or Chinese, if explicitly passed)
// so accessing /ru/blog, /ar/blog, etc. never throws.

export const SUPPORTED_LANGS = [
  'en',
  'zh',
  'ru',
  'ar',
  'de',
  'ja',
  'fr',
  'es',
  'pt',
  'ko',
] as const

export type Language = (typeof SUPPORTED_LANGS)[number]

export const isSupportedLang = (lang: string): lang is Language =>
  (SUPPORTED_LANGS as readonly string[]).includes(lang)

/**
 * Resolve an incoming `lang` segment (from the URL) to a supported language.
 * Always returns a valid `Language` — falls back to English.
 */
export function resolveLang(lang: string | undefined | null): Language {
  if (lang && isSupportedLang(lang)) return lang
  return 'en'
}

/**
 * Pick a localized string from a `{ en, zh }` record.
 * If the requested language isn't present, fall back to `zh` (when the
 * requested language is non-English) then to `en`.
 *
 * Use this anywhere you currently do:
 *   obj[supportedLang as 'en' | 'zh']
 */
export function pickLocalized<T>(
  obj: Partial<Record<Language, T>> | { en: T; zh: T },
  lang: Language,
): T {
  const direct = (obj as Record<string, T | undefined>)[lang]
  if (direct !== undefined && direct !== null) return direct
  if (lang !== 'zh') {
    const zh = (obj as Record<string, T | undefined>).zh
    if (zh !== undefined && zh !== null) return zh
  }
  return (obj as Record<string, T | undefined>).en as T
}

/**
 * Same as `pickLocalized` but for arrays; returns `[]` when nothing matches
 * so callers can safely call `.slice().map()` without null checks.
 */
export function pickLocalizedArray<T>(
  obj: Partial<Record<Language, T[]>> | { en: T[]; zh: T[] },
  lang: Language,
): T[] {
  const direct = (obj as Record<string, T[] | undefined>)[lang]
  if (Array.isArray(direct)) return direct
  if (lang !== 'zh') {
    const zh = (obj as Record<string, T[] | undefined>).zh
    if (Array.isArray(zh)) return zh
  }
  const en = (obj as Record<string, T[] | undefined>).en
  return Array.isArray(en) ? en : []
}
