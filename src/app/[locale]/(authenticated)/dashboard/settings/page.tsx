import { Suspense } from "react"

import { SettingsPageClient } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsPageClient"
import { Skeleton } from "@/components/ui/skeleton"

function SettingsPageFallback() {
  return (
    <div className="space-y-10 pb-20" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-3">
          <Skeleton className="h-12 rounded-2xl" />
          <Skeleton className="h-12 rounded-2xl" />
          <Skeleton className="h-12 rounded-2xl" />
          <Skeleton className="h-12 rounded-2xl" />
        </div>
        <div className="space-y-6 lg:col-span-9">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageFallback />}>
      <SettingsPageClient />
    </Suspense>
  )
}
