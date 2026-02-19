import { Suspense } from "react"

import { SettingsView } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView"
import { Skeleton } from "@/components/ui/skeleton"

function SettingsPageFallback() {
  return (
    <div className="space-y-12 pb-24" aria-busy="true" aria-live="polite">
      {/* Header skeleton */}
      <div className="space-y-5 pt-6 pb-2">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-14 w-64 lg:w-96" />
        <Skeleton className="h-5 w-full max-w-xl" />
        <div className="mt-10 flex items-center">
          <Skeleton className="h-[2px] w-12" />
          <div className="h-[1px] flex-1 bg-border/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
        {/* Sidebar skeleton */}
        <div className="space-y-2 lg:col-span-3 lg:top-24 lg:sticky">
          <Skeleton className="h-3 w-32 ml-5 mb-6" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-2.5 w-32" />
              </div>
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="space-y-8 lg:col-span-9">
          <Skeleton className="h-[500px] rounded-[2.5rem]" />
          <Skeleton className="h-[300px] rounded-[2.5rem]" />
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
