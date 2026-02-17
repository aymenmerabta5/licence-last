import { Suspense } from "react"

import { UserManagementView } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView"
import { Skeleton } from "@/components/ui/skeleton"
import { requireRole } from "@/lib/auth-guards"

function UserManagementFallback() {
  return (
    <div className="max-w-6xl mx-auto space-y-8" aria-busy="true" aria-live="polite">
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

export default async function UserManagementPage() {
  await requireRole(["university_admin", "super_admin"])

  return (
    <Suspense fallback={<UserManagementFallback />}>
      <UserManagementView />
    </Suspense>
  )
}
