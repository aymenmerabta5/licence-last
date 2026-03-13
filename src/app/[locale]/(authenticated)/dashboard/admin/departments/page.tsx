import { Suspense } from "react"
import { DepartmentsView } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView"
import { Skeleton } from "@/components/ui/skeleton"
import { requireApprovedUniversityAdmin } from "@/lib/dashboard-access"

function DepartmentsFallback() {
  return (
    <div
      className="max-w-4xl mx-auto space-y-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-[30rem] max-w-full" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  )
}

export default async function DepartmentsPage() {
  await requireApprovedUniversityAdmin()

  return (
    <Suspense fallback={<DepartmentsFallback />}>
      <DepartmentsView />
    </Suspense>
  )
}
