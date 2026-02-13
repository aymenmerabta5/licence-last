import { Suspense } from "react"

import { CommandCenterView } from "./_components/CommandCenterView"
import { Skeleton } from "@/components/ui/skeleton"
import { requireRole } from "@/lib/auth-guards"

function CommandCenterFallback() {
  return (
    <div className="max-w-6xl mx-auto space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-[30rem] max-w-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  )
}

export default async function CommandCenterPage() {
  await requireRole(["super_admin"])

  return (
    <Suspense fallback={<CommandCenterFallback />}>
      <CommandCenterView />
    </Suspense>
  )
}
