import type { Metadata } from "next"
import type { ReactNode } from "react"

import { getTranslations } from "next-intl/server"

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
}: LocaleLayoutProps) {
  return children
}
