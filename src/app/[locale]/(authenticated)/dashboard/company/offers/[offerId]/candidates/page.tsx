import { Suspense } from "react"

import { CandidatesView } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView"
import { Skeleton } from "@/components/ui/skeleton"
import { requireRole } from "@/lib/auth-guards"

interface CandidatesPageProps {
  params: Promise<{ offerId: string }>
}

function CandidatesPageFallback() {
  return (
    <div className="w-full space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="grid grid-flow-col auto-cols-[minmax(280px,1fr)] gap-4 min-w-[1760px] overflow-hidden">
        <Skeleton className="h-[70vh]" />
        <Skeleton className="h-[70vh]" />
        <Skeleton className="h-[70vh]" />
      </div>
    </div>
  )
}

export default async function CandidatesPage({ params }: CandidatesPageProps) {
  await requireRole(["company_admin"])
  const { offerId } = await params

  return (
    <Suspense fallback={<CandidatesPageFallback />}>
      <CandidatesView offerId={offerId} />
    </Suspense>
  )
}
