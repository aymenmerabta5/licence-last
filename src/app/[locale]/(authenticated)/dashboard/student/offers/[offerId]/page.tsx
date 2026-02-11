import { notFound } from "next/navigation"

import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"
import {
  getOfferById,
  getStudentApplicationForOffer,
} from "@/server/services/offers/get"
import { OfferDetailClient } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetailClient"

type Params = Promise<{ offerId: string }>

export default async function StudentOfferDetailPage({
  params,
}: {
  params: Params
}) {
  const [{ offerId }, user] = await Promise.all([
    params,
    requireRole(["student"]),
  ])

  if (!user.onboardingCompleted) {
    return localeRedirect("/onboarding/student")
  }

  const offer = await getOfferById(offerId)

  if (!offer || offer.status !== "published") {
    notFound()
  }

  const existingApplication = await getStudentApplicationForOffer(offerId, user.id)

  return (
    <OfferDetailClient
      offer={offer}
      existingApplication={existingApplication}
      studentUserId={user.id}
    />
  )
}
