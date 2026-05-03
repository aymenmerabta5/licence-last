import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { MaintenancePage } from "@/app/[locale]/_components/MaintenancePage"

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "maintenance" })

  return {
    title: t("title"),
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function MaintenanceRoute({ params }: { params: Params }) {
  const { locale } = await params

  return (
    <div lang={locale}>
      <MaintenancePage />
    </div>
  )
}
