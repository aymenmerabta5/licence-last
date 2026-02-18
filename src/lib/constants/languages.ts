export const LANGUAGE_CODES = [
  "ar",
  "de",
  "en",
  "es",
  "fr",
  "it",
  "ja",
  "pt",
  "ru",
  "tr",
  "tzm",
  "zh",
] as const

export type LanguageCode = (typeof LANGUAGE_CODES)[number]

export type SupportedLocale = "en" | "fr" | "ar"

export interface LanguageCatalogEntry {
  code: LanguageCode
  labels: Record<SupportedLocale, string>
}

export const LANGUAGE_CATALOG: LanguageCatalogEntry[] = [
  {
    code: "ar",
    labels: { en: "Arabic", fr: "Arabe", ar: "العربية" },
  },
  {
    code: "de",
    labels: { en: "German", fr: "Allemand", ar: "الألمانية" },
  },
  {
    code: "en",
    labels: { en: "English", fr: "Anglais", ar: "الإنجليزية" },
  },
  {
    code: "es",
    labels: { en: "Spanish", fr: "Espagnol", ar: "الإسبانية" },
  },
  {
    code: "fr",
    labels: { en: "French", fr: "Français", ar: "الفرنسية" },
  },
  {
    code: "it",
    labels: { en: "Italian", fr: "Italien", ar: "الإيطالية" },
  },
  {
    code: "ja",
    labels: { en: "Japanese", fr: "Japonais", ar: "اليابانية" },
  },
  {
    code: "pt",
    labels: { en: "Portuguese", fr: "Portugais", ar: "البرتغالية" },
  },
  {
    code: "ru",
    labels: { en: "Russian", fr: "Russe", ar: "الروسية" },
  },
  {
    code: "tr",
    labels: { en: "Turkish", fr: "Turc", ar: "التركية" },
  },
  {
    code: "tzm",
    labels: { en: "Tamazight", fr: "Tamazight", ar: "الأمازيغية" },
  },
  {
    code: "zh",
    labels: { en: "Chinese", fr: "Chinois", ar: "الصينية" },
  },
]

export const DEFAULT_STUDENT_LANGUAGE_CODE: LanguageCode = "en"
export const DEFAULT_STUDENT_LANGUAGE_PROFICIENCY = "b1"
export const DEFAULT_OFFER_LANGUAGE_CODE: LanguageCode = "en"
export const DEFAULT_OFFER_MINIMUM_PROFICIENCY = "b1"
export const DEFAULT_OFFER_LANGUAGE_REQUIRED = true
export const DEFAULT_OFFER_LANGUAGE_WEIGHT = 1

export function normalizeLanguageCode(code: string) {
  return code.trim().toLowerCase()
}

export function normalizeLanguageEntries<
  TLanguageEntry extends { languageCode: string },
>(languages: TLanguageEntry[]) {
  const deduped = new Map<string, TLanguageEntry>()

  for (const language of languages) {
    const normalizedCode = normalizeLanguageCode(language.languageCode)
    deduped.set(normalizedCode, {
      ...language,
      languageCode: normalizedCode,
    })
  }

  return [...deduped.values()]
}

export function hasDuplicateLanguageCodes<
  TLanguageEntry extends { languageCode: string },
>(languages: TLanguageEntry[]) {
  const seen = new Set<string>()

  for (const language of languages) {
    const code = normalizeLanguageCode(language.languageCode)
    if (seen.has(code)) {
      return true
    }
    seen.add(code)
  }

  return false
}

export function getLanguageLabel(
  code: LanguageCode,
  locale: SupportedLocale = "en",
) {
  const entry = LANGUAGE_CATALOG.find((item) => item.code === code)
  return entry?.labels[locale] ?? code
}
