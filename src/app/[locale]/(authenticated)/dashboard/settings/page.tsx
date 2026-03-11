import { Suspense } from "react"

import { SettingsView } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView"
import { Skeleton } from "@/components/ui/skeleton"

function SettingsPageFallback() {
  return (
    <div
      className="max-w-7xl mx-auto space-y-10 pb-24"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Header skeleton — matches the rounded hero card */}
      <Skeleton className="h-48 sm:h-52 rounded-[2.5rem]" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
        {/* Sidebar skeleton — matches the card container */}
        <div className="lg:col-span-3 lg:top-24 lg:sticky">
          <div className="rounded-[2rem] border border-border/30 bg-background/60 p-3 space-y-1">
            <Skeleton className="h-3 w-24 ms-4 mt-3 mb-4" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2.5">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-2.5 w-28" />
                </div>
              </div>
            ))}
          </div>
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
