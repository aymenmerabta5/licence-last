import type { Route } from "next"

import { redirect } from "next/navigation"

type Params = Promise<{ locale: string; offerId: string }>

export default async function OfferDetailPage({
  params,
}: {
  params: Params
}) {
  const { locale, offerId } = await params
  redirect(`/${locale}/dashboard/student/offers/${offerId}` as Route)
}
