import { Suspense } from "react"

import { CandidatesView } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView"
import { Skeleton } from "@/components/ui/skeleton"
import { requireApprovedCompanyAdmin } from "@/lib/dashboard-access"

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

      <div className="grid grid-flow-row md:grid-flow-col grid-cols-1 md:auto-cols-[minmax(280px,1fr)] gap-4 min-w-0 md:min-w-[1760px] overflow-y-auto md:overflow-x-auto md:overflow-y-hidden">
        <Skeleton className="h-[70vh]" />
        <Skeleton className="h-[70vh]" />
        <Skeleton className="h-[70vh]" />
      </div>
    </div>
  )
}

async function CandidatesPageContent({ params }: CandidatesPageProps) {
  await requireApprovedCompanyAdmin()
  const { offerId } = await params

  return <CandidatesView offerId={offerId} />
}

export default function CandidatesPage({ params }: CandidatesPageProps) {
  return (
    <Suspense fallback={<CandidatesPageFallback />}>
      <CandidatesPageContent params={params} />
    </Suspense>
  )
}
