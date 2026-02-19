import { Suspense } from "react"

import { OfferDetailRedirect } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetailRedirect"

type Params = Promise<{ offerId: string }>

/**
 * Offer detail page wrapper with cacheComponents support.
 * Uses Suspense boundary for the redirect logic.
 */
export default async function OfferDetailPage({ params }: { params: Params }) {
  const { offerId } = await params

  return (
    <Suspense fallback={null}>
      <OfferDetailRedirect offerId={offerId} />
    </Suspense>
  )
}
