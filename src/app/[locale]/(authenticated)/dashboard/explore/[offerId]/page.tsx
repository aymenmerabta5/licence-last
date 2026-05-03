import { Suspense } from "react"
import { notFound } from "next/navigation"

import { OfferDetailClient } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail"
import { Skeleton } from "@/components/ui/skeleton"
import { requireOnboardedStudent } from "@/lib/dashboard-access"
import {
  getOfferById,
  getStudentApplicationForOffer,
} from "@/server/services/offers/get"

type Params = Promise<{ offerId: string }>

function OfferDetailFallback() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-72" />
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}

async function OfferDetailPageContent({ params }: { params: Params }) {
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

export default function OfferDetailPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<OfferDetailFallback />}>
      <OfferDetailPageContent params={params} />
    </Suspense>
  )
}
