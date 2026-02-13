import { Suspense } from "react"

import { AdminValidationsView } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/_components/AdminValidationsView"
import { Skeleton } from "@/components/ui/skeleton"
import { requireRole } from "@/lib/auth-guards"

function AdminValidationsFallback() {
  return (
    <div className="max-w-5xl mx-auto space-y-8" aria-busy="true" aria-live="polite">
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

export default async function AdminValidationsPage() {
  await requireRole(["university_admin", "super_admin"])

  return (
    <Suspense fallback={<AdminValidationsFallback />}>
      <AdminValidationsView />
    </Suspense>
  )
}
