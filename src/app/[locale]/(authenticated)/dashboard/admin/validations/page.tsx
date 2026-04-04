import { Suspense } from "react"

import { AdminValidationsView } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/_components/AdminValidationsView"
import { Skeleton } from "@/components/ui/skeleton"
import { requirePlacementValidationAdmin } from "@/lib/dashboard-access"

function AdminValidationsFallback() {
  return (
    <div
      className="max-w-7xl mx-auto space-y-10"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-[30rem] max-w-full" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
    </div>
  )
}

async function AdminValidationsPageContent() {
  await requirePlacementValidationAdmin()

  return <AdminValidationsView />
}

export default function AdminValidationsPage() {
  return (
    <Suspense fallback={<AdminValidationsFallback />}>
      <AdminValidationsPageContent />
    </Suspense>
  )
}
