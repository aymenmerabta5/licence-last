import { Suspense } from "react"
import { headers } from "next/headers"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import {
  DOCUMENT_LOCALE_HEADER,
  resolveDocumentLocale,
} from "@/lib/document-locale"

const ROOT_NOT_FOUND_FALLBACK = {
  description:
    "The page you are looking for could not be found from this entry point.",
  headline: "Page Not Found",
  locale: "en",
  returnHome: "Return to Home",
} as const

function RootNotFoundContent({
  description,
  headline,
  locale,
  returnHome,
}: {
  description: string
  headline: string
  locale: string
  returnHome: string
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
        404
      </span>
      <div className="space-y-3">
        <h1 className="font-serif text-3xl text-heading">{headline}</h1>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      <Link
        href={`/${locale}`}
        className="inline-flex h-10 items-center justify-center border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
      >
        {returnHome}
      </Link>
    </main>
  )
}

async function LocalizedRootNotFoundContent() {
  const requestHeaders = await headers()
  const locale = resolveDocumentLocale(
    requestHeaders.get(DOCUMENT_LOCALE_HEADER),
  )
  const t = await getTranslations({ locale, namespace: "notFound" })

  return (
    <RootNotFoundContent
      locale={locale}
      headline={t("headline")}
      description={t("description")}
      returnHome={t("returnHome")}
    />
  )
}

export default function RootNotFoundPage() {
  return (
    <Suspense fallback={<RootNotFoundContent {...ROOT_NOT_FOUND_FALLBACK} />}>
      <LocalizedRootNotFoundContent />
    </Suspense>
  )
}
