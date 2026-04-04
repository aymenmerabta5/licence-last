export const DOCUMENT_LOCALE_HEADER = "X-NEXT-INTL-LOCALE"

export type DocumentLocale = "en" | "fr" | "ar"
export type DocumentDirection = "ltr" | "rtl"

export function resolveDocumentLocale(
  locale: string | null | undefined,
): DocumentLocale {
  if (locale === "en" || locale === "fr" || locale === "ar") {
    return locale
  }

  return "en"
}

export function getDocumentDirection(
  locale: DocumentLocale,
): DocumentDirection {
  return locale === "ar" ? "rtl" : "ltr"
}

export function resolveDocumentSettings(locale: string | null | undefined): {
  locale: DocumentLocale
  direction: DocumentDirection
} {
  const resolvedLocale = resolveDocumentLocale(locale)

  return {
    locale: resolvedLocale,
    direction: getDocumentDirection(resolvedLocale),
  }
}
