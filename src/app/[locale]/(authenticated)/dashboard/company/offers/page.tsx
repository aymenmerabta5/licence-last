import { Suspense } from "react"

import { CompanyOffersView } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView"
import { Skeleton } from "@/components/ui/skeleton"
import { requireRole } from "@/lib/auth-guards"

function CompanyOffersFallback() {
  return (
    <div className="max-w-4xl mx-auto space-y-8" aria-busy="true" aria-live="polite">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-11 w-36" />
      </div>

      <Skeleton className="h-20" />

      <div className="space-y-4">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    </div>
  )
}

export default async function CompanyOffersPage() {
  await requireRole(["company_admin"])

  return (
    <Suspense fallback={<CompanyOffersFallback />}>
      <CompanyOffersView />
    </Suspense>
  )
}
