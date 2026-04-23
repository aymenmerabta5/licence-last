import { Suspense } from "react"

import { UniversityProfileView } from "@/app/[locale]/(authenticated)/dashboard/university/profile/_components/UniversityProfileView"
import { Skeleton } from "@/components/ui/skeleton"
import { requireApprovedUniversityAdmin } from "@/lib/dashboard-access"

function UniversityProfileFallback() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <Skeleton className="h-4 w-32" />
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-48" />
    </div>
  )
}

async function UniversityProfilePageContent() {
  await requireApprovedUniversityAdmin()
  return <UniversityProfileView />
}

export default function UniversityProfilePage() {
  return (
    <Suspense fallback={<UniversityProfileFallback />}>
      <UniversityProfilePageContent />
    </Suspense>
  )
}
