import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"

type Params = Promise<{ locale: string }>

export default async function CompanyMissingSlugPage({
  params,
}: {
  params: Params
}) {
  const { locale } = await params
  setRequestLocale(locale)

  notFound()
}
