import type { Metadata } from "next"
import { cacheLife } from "next/cache"
import { headers } from "next/headers"
import { NextIntlClientProvider } from "next-intl"
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server"
import type { ReactNode } from "react"

import { DocumentLocaleSync } from "@/app/[locale]/_components/DocumentLocaleSync"
import { MaintenancePage } from "@/app/[locale]/_components/MaintenancePage"
import { MotionProvider } from "@/components/providers/MotionProvider"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { Toaster } from "@/components/ui/sonner"
import { routing } from "@/i18n/routing"
import {
  getMaintenanceMode,
  isMaintenanceBypass,
} from "@/lib/maintenance-guard"
import { getPublicAppUrl } from "@/lib/public-url"
import { getFreshAuthSession } from "@/server/auth/get-fresh-session"

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

function isWhitelistedAuthPath(pathname: string): boolean {
  const whitelist = ["/login", "/signup", "/reset-password", "/verify"]
  return (
    whitelist.some((p) => pathname.includes(p)) ||
    pathname.startsWith("/api/auth")
  )
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

  const requestHeaders = await headers()
  const pathname =
    requestHeaders.get("x-invoke-path") ??
    requestHeaders.get("next-url") ??
    "/"
  const isAuthPath = isWhitelistedAuthPath(pathname)

  const isDevelopment = process.env.NODE_ENV === "development"

  let showMaintenance = false
  if (!isAuthPath && !isDevelopment) {
    try {
      const maintenanceEnabled = await getMaintenanceMode()
      if (maintenanceEnabled) {
        const session = await getFreshAuthSession(requestHeaders)
        const userRole = session?.user?.role ?? null
        const impersonatedBy =
          typeof session?.session?.impersonatedBy === "string"
            ? session.session.impersonatedBy
            : null
        const canBypass = await isMaintenanceBypass(userRole, impersonatedBy)
        if (!canBypass) {
          showMaintenance = true
        }
      }
    } catch {
      // Fail-open: if the DB is unreachable, allow normal access.
    }
  }

  if (showMaintenance) {
    return (
      <div dir={direction} className={rtlFontVars}>
        <DocumentLocaleSync
          locale={locale}
          direction={direction}
          isRTL={isRTL}
        />
        <MotionProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <MaintenancePage />
          </NextIntlClientProvider>
        </MotionProvider>
      </div>
    )
  }

  return (
    <div dir={direction} className={rtlFontVars}>
      <DocumentLocaleSync locale={locale} direction={direction} isRTL={isRTL} />
      <MotionProvider>
        <QueryProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </QueryProvider>
      </MotionProvider>
      <Toaster richColors />
    </div>
  )
}
