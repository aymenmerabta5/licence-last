import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server"
import { cacheLife } from "next/cache"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"

import { DocumentLocaleSync } from "@/app/[locale]/_components/DocumentLocaleSync"
import { MotionProvider } from "@/components/providers/MotionProvider"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { Toaster } from "@/components/ui/sonner"
import { routing } from "@/i18n/routing"
import { getPublicAppUrl } from "@/lib/public-url"

type Params = Promise<{ locale: string }>

interface LocaleLayoutProps {
  children: ReactNode
  params: Params
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })

  const baseUrl = getPublicAppUrl()

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t("title"),
      template: "%s | Stag",
    },
    description: t("description"),
    openGraph: {
      title: {
        default: t("title"),
        template: "%s | Stag",
      },
      description: t("description"),
      siteName: "Stag",
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: {
        default: t("title"),
        template: "%s | Stag",
      },
      description: t("description"),
    },
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
  }
}

async function getMessagesCached(locale: string) {
  "use cache"
  cacheLife("hours")
  return getMessages({ locale })
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const messages = await getMessagesCached(locale)
  const isRTL = locale === "ar"
  const direction = isRTL ? "rtl" : "ltr"
  const rtlFontVars = isRTL
    ? "[--font-sans:var(--font-arabic),var(--font-dm-sans)] [--font-serif:var(--font-arabic),var(--font-dm-serif)]"
    : ""

  return (
    <div dir={direction} className={rtlFontVars}>
      <DocumentLocaleSync
        locale={locale}
        direction={direction}
        isRTL={isRTL}
      />
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <MotionProvider>
          <QueryProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              {children}
            </NextIntlClientProvider>
          </QueryProvider>
        </MotionProvider>
        <Toaster richColors />
      </ThemeProvider>
    </div>
  )
}
