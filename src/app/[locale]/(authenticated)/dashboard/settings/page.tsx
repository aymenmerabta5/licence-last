import { Suspense } from "react"

import { SettingsView } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView"
import { Skeleton } from "@/components/ui/skeleton"

function SettingsPageFallback() {
  return (
    <div className="space-y-8 pb-20" aria-busy="true" aria-live="polite">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
        <div className="mt-4 h-px bg-border/20" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Sidebar skeleton */}
        <div className="space-y-2 lg:col-span-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-2.5 w-28" />
              </div>
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="space-y-6 lg:col-span-9">
          <Skeleton className="h-72 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageFallback />}>
      <SettingsView />
    </Suspense>
  )
}
