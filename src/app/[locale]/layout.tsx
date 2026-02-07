import type { Metadata } from "next"
import type { ReactNode } from "react"

import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"

type Params = Promise<{ locale: string }>

interface LocaleLayoutProps {
  children: ReactNode
  params: Params
}

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
}: LocaleLayoutProps) {
  const { locale } = await params
  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}