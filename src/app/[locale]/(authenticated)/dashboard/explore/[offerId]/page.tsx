import { redirect, notFound } from "next/navigation"

import { requireRole } from "@/lib/auth-guards"
import { getOfferById, getStudentApplicationForOffer } from "@/server/services/offers/get"
import { OfferDetailClient } from "./_components/OfferDetailClient"

type Params = Promise<{ locale: string; offerId: string }>

export default async function OfferDetailPage({
  params,
}: {
  params: Params
}) {
  const [{ locale, offerId }, user] = await Promise.all([
    params,
    requireRole(["student"]),
  ])

  if (!user.onboardingCompleted) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redirect(`/${locale}/onboarding/student` as any)
  }

  const offer = await getOfferById(offerId)

  if (!offer || offer.status !== "published") {
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
    />
  )
}
