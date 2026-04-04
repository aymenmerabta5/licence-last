import { Suspense } from "react"

import { UserManagementView } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView"
import { Skeleton } from "@/components/ui/skeleton"
import { requireApprovedUniversityAdmin } from "@/lib/dashboard-access"

function UserManagementFallback() {
  return (
    <div
      className="max-w-7xl mx-auto space-y-10"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-[400px]" />
    </div>
  )
}

async function UserManagementPageContent() {
  await requireApprovedUniversityAdmin()

  return <UserManagementView />
}

export default function UserManagementPage() {
  return (
    <Suspense fallback={<UserManagementFallback />}>
      <UserManagementPageContent />
    </Suspense>
  )
}
