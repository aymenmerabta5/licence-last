import type { Metadata } from "next"
import type { ReactNode } from "react"

import { DM_Sans, DM_Serif_Display, Noto_Sans_Arabic } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server"
import { ThemeProvider } from "next-themes"

import { MotionProvider } from "@/components/providers/MotionProvider"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { Toaster } from "@/components/ui/sonner"
import { env } from "@/env"
import { routing } from "@/i18n/routing"

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
})

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif",
  display: "swap",
})

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
})

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

  const baseUrl = env.NEXT_PUBLIC_BETTER_AUTH_URL

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t("title"),
      template: "%s | Internex",
    },
    description: t("description"),
    openGraph: {
      title: {
        default: t("title"),
        template: "%s | Internex",
      },
      description: t("description"),
      siteName: "Internex",
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: {
        default: t("title"),
        template: "%s | Internex",
      },
      description: t("description"),
    },
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}`])
      ),
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const messages = await getMessages({ locale })
  const isRTL = locale === "ar"
  const rtlFontVars = isRTL
    ? "[--font-sans:var(--font-arabic),var(--font-dm-sans)] [--font-serif:var(--font-arabic),var(--font-dm-serif)]"
    : ""

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body
        className={`${dmSans.variable} ${dmSerif.variable} ${notoSansArabic.variable} ${rtlFontVars} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <MotionProvider>
            <QueryProvider>
              <NextIntlClientProvider locale={locale} messages={messages}>
                {children}
              </NextIntlClientProvider>
            </QueryProvider>
          </MotionProvider>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
