import { notFound } from "next/navigation"

import { OfferDetailClient } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail"
import { requireOnboardedStudent } from "@/lib/dashboard-access"
import {
  getOfferById,
  getStudentApplicationForOffer,
} from "@/server/services/offers/get"

type Params = Promise<{ offerId: string }>

export default async function OfferDetailPage({ params }: { params: Params }) {
  const [{ offerId }, { user }] = await Promise.all([
    params,
    requireOnboardedStudent(),
  ])

  const offer = await getOfferById(offerId)

  if (
    !offer ||
    offer.status !== "published" ||
    offer.companyStatus !== "approved"
  ) {
    notFound()
  }

  const existingApplication = await getStudentApplicationForOffer(
    offerId,
    user.id,
  )

  return (
    <OfferDetailClient
      offer={offer}
      existingApplication={existingApplication}
      studentUserId={user.id}
    />
  )
}
