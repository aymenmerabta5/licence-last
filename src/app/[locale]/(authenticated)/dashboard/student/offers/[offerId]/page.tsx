import { localeRedirect } from "@/lib/navigation"

type Params = Promise<{ offerId: string }>

export default async function StudentOfferDetailPage({
  params,
}: {
  params: Params
}) {
  const { offerId } = await params

  return localeRedirect(`/dashboard/explore/${offerId}`)
}
