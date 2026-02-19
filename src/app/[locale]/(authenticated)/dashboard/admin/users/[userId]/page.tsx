import { Suspense } from "react"

import { UserDetailView } from "@/app/[locale]/(authenticated)/dashboard/admin/users/[userId]/_components/UserDetailView"
import { Skeleton } from "@/components/ui/skeleton"
import { requireRole } from "@/lib/auth-guards"

function UserDetailFallback() {
  return (
    <div
      className="max-w-4xl mx-auto space-y-8"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-4 w-32" />
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-48" />
      <Skeleton className="h-48" />
    </div>
  )
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  await requireRole(["super_admin"])
  const { userId } = await params

  return (
    <Suspense fallback={<UserDetailFallback />}>
      <UserDetailView userId={userId} />
    </Suspense>
  )
}
