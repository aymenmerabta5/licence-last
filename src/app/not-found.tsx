import { ArrowRight } from "lucide-react"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import {
  DOCUMENT_LOCALE_HEADER,
  resolveDocumentLocale,
} from "@/lib/document-locale"

const FALLBACK = {
  description:
    "The page you are looking for could not be found from this entry point.",
  edition: "Missing Edition",
  headline: "Page Not Found",
  locale: "en",
  returnHome: "Return to Home",
  suggestion: "We suggest starting from the main edition",
} as const

function RootFallbackContent({
  description,
  edition,
  headline,
  locale,
  returnHome,
  suggestion,
}: {
  description: string
  edition: string
  headline: string
  locale: string
  returnHome: string
  suggestion: string
}) {
  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <div className="flex-1 relative flex items-center justify-center overflow-x-clip px-6 py-16 lg:py-24">
        {/* Ambient glow — dark mode only */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100"
          aria-hidden="true"
        >
          <div className="absolute -top-20 -start-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-28 start-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/15" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
          <span className="text-[10px] font-medium tracking-[0.35em] uppercase text-primary mb-10 [[dir=rtl]_&]:tracking-normal">
            {edition}
          </span>

          <div className="flex items-center justify-center gap-4" aria-hidden="true">
            <span
              className="h-px bg-foreground/15 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ width: 56 }}
            />
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span
              className="h-px bg-foreground/15 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ width: 56 }}
            />
          </div>

          <span
            className="font-serif text-heading transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] dark:drop-shadow-[0_0_24px_var(--color-primary)] block mt-10 mb-6"
            style={{
              fontSize: "clamp(7rem, 18vw, 14rem)",
              lineHeight: 0.85,
              letterSpacing: "-0.04em",
            }}
          >
            4
            <span className="relative inline-block">
              <span className="text-primary">0</span>
              <span className="absolute -bottom-1 start-0 end-0 h-[3px] bg-primary origin-left [[dir=rtl]_&]:origin-right" aria-hidden="true" />
            </span>
            4
          </span>

          <div className="flex items-center justify-center gap-4" aria-hidden="true">
            <span
              className="h-px bg-foreground/15 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ width: 40 }}
            />
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span
              className="h-px bg-foreground/15 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ width: 40 }}
            />
          </div>

          <h1 className="font-serif text-2xl md:text-3xl text-heading tracking-tight mt-8 mb-4 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
            {headline}
          </h1>

          <div className="w-full max-w-xs mb-6">
            <div className="h-px bg-border/50 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" />
          </div>

          <p className="text-sm leading-relaxed font-light text-muted-foreground max-w-sm mb-10 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
            {description}
          </p>

          <a
            href={`/${locale}`}
            className="inline-flex h-10 items-center justify-center border-2 border-secondary bg-transparent px-5 text-xs font-bold uppercase tracking-[0.15em] text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground gap-3"
          >
            {returnHome}
            <ArrowRight className="h-4 w-4" />
          </a>

          <div className="mt-14 flex items-center justify-center gap-4" aria-hidden="true">
            <span
              className="h-px bg-foreground/15 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ width: 20 }}
            />
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span
              className="h-px bg-foreground/15 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ width: 20 }}
            />
          </div>

          <p className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground/50 mt-8 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] [[dir=rtl]_&]:tracking-normal">
            {suggestion}
          </p>
        </div>
      </div>
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
    <RootFallbackContent
      locale={locale}
      edition={t("edition")}
      headline={t("headline")}
      description={t("description")}
      returnHome={t("returnHome")}
      suggestion={t("suggestion")}
    />
  )
}

export default function RootNotFoundPage() {
  return (
    <Suspense fallback={<RootFallbackContent {...FALLBACK} />}>
      <LocalizedRootNotFoundContent />
    </Suspense>
  )
}
