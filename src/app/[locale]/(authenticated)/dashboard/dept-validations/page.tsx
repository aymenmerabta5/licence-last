import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { requireRole } from "@/lib/auth-guards"

import { DeptHeadValidationsView } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/_components/DeptHeadValidationsView"

function DeptValidationsFallback() {
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

export default async function DeptValidationsPage() {
  await requireRole(["dept_head"])

  return (
    <Suspense fallback={<DeptValidationsFallback />}>
      <DeptHeadValidationsView />
    </Suspense>
  )
}
