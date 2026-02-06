import type { Metadata } from "next"
import { DM_Sans, DM_Serif_Display, Noto_Sans_Arabic } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { getTranslations } from "next-intl/server"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"

import "../globals.css"

type Params = Promise<{ locale: string }>

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

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Params
}) {
  const { locale } = await params
  const messages = await getMessages()

  const isRTL = locale === "ar"

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body
        className={`${dmSans.variable} ${dmSerif.variable} ${notoSansArabic.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
