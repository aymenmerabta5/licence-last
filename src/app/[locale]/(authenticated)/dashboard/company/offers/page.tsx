import { Suspense } from "react"

import { CompanyOffersView } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView"
import { Skeleton } from "@/components/ui/skeleton"
import { requireApprovedCompanyAdmin } from "@/lib/dashboard-access"
import { getCompanyMembership } from "@/server/services/companies/membership"

function CompanyOffersFallback() {
  return (
    <div
      className="max-w-4xl mx-auto space-y-8"
      aria-busy="true"
      aria-live="polite"
    >
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

async function CompanyOffersPageContent() {
  const { user } = await requireApprovedCompanyAdmin()
  const membership = await getCompanyMembership(user.id)

  return <CompanyOffersView canManageStatus={membership?.role === "owner"} />
}

export default function CompanyOffersPage() {
  return (
    <Suspense fallback={<CompanyOffersFallback />}>
      <CompanyOffersPageContent />
    </Suspense>
  )
}
