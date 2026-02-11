import { Suspense } from "react"

import { CandidatesClient } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesClient"
import { Skeleton } from "@/components/ui/skeleton"
import { requireRole } from "@/lib/auth-guards"

interface CandidatesPageProps {
  params: Promise<{ offerId: string }>
}

function CandidatesPageFallback() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3 2xl:grid-cols-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  )
}

export default async function CandidatesPage({ params }: CandidatesPageProps) {
  await requireRole(["company_admin"])
  const { offerId } = await params

  return (
    <Suspense fallback={<CandidatesPageFallback />}>
      <CandidatesClient offerId={offerId} />
    </Suspense>
  )
}
