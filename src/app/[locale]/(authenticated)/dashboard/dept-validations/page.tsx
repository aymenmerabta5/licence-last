import { Suspense } from "react"
import { DeptHeadValidationsView } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/_components/DeptHeadValidationsView"
import { Skeleton } from "@/components/ui/skeleton"
import { requireDepartmentHead } from "@/lib/dashboard-access"

function DeptValidationsFallback() {
  return (
    <div
      className="max-w-5xl mx-auto space-y-8"
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

async function DeptValidationsPageContent() {
  await requireDepartmentHead()

  return <DeptHeadValidationsView />
}

export default function DeptValidationsPage() {
  return (
    <Suspense fallback={<DeptValidationsFallback />}>
      <DeptValidationsPageContent />
    </Suspense>
  )
}
