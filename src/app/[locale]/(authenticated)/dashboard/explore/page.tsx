import type { Route } from "next"

import { redirect } from "next/navigation"

type Params = Promise<{ locale: string }>

export default async function ExplorePage({
  params,
}: {
  params: Params
}) {
  const { locale } = await params
  redirect(`/${locale}/dashboard/student/search` as Route)
}
