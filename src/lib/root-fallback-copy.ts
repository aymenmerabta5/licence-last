import {
  getDocumentDirection,
  type DocumentLocale,
  resolveDocumentLocale,
} from "@/lib/document-locale"

interface RootFallbackCopy {
  errorId: string
  returnHome: string
  retry: string
  title: string
}

const ROOT_FALLBACK_COPY: Record<DocumentLocale, RootFallbackCopy> = {
  en: {
    errorId: "Error ID",
    returnHome: "Return home",
    retry: "Try again",
    title: "Something went wrong",
  },
  fr: {
    errorId: "ID de l'erreur",
    returnHome: "Retour a l'accueil",
    retry: "Reessayer",
    title: "Une erreur est survenue",
  },
  ar: {
    errorId: "معرّف الخطأ",
    returnHome: "العودة إلى الرئيسية",
    retry: "إعادة المحاولة",
    title: "حدث خطأ ما",
  },
}

export function getRootFallbackSettings(locale: string | null | undefined) {
  const resolvedLocale = resolveDocumentLocale(locale)

  return {
    locale: resolvedLocale,
    direction: getDocumentDirection(resolvedLocale),
    copy: ROOT_FALLBACK_COPY[resolvedLocale],
  }
}
