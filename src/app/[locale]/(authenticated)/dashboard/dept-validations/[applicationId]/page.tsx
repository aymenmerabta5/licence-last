import { Suspense } from "react"
import { DeptHeadPlacementDetail } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail"
import { Skeleton } from "@/components/ui/skeleton"
import { requireRole } from "@/lib/auth-guards"

interface DeptHeadPlacementDetailPageProps {
  params: Promise<{ applicationId: string }>
}

function PlacementDetailFallback() {
  return (
    <div
      className="max-w-4xl mx-auto space-y-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-10 w-72" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
        <Skeleton className="h-72 lg:col-span-2" />
      </div>
    </div>
  )
}

export default async function DeptHeadPlacementDetailPage({
  params,
}: DeptHeadPlacementDetailPageProps) {
  await requireRole(["dept_head"])
  const { applicationId } = await params

  return (
    <Suspense fallback={<PlacementDetailFallback />}>
      <DeptHeadPlacementDetail applicationId={applicationId} />
    </Suspense>
  )
}
