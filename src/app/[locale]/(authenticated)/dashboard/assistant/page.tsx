import { Suspense } from "react"

import { AssistantPageContent } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantPageContent"
import { Skeleton } from "@/components/ui/skeleton"

function AssistantPageFallback() {
  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(100vh - 12rem)", minHeight: "500px" }}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="space-y-3 border-b border-border/50 pb-5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="flex-1 flex flex-row gap-6 min-h-0 pt-6">
        <div className="hidden lg:block w-[320px] shrink-0">
          <Skeleton className="h-full rounded-none border border-border/60" />
        </div>

        <div className="flex-1 min-h-0 min-w-0 rounded-none border border-border/60 bg-card/40 p-4 sm:p-5">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<AssistantPageFallback />}>
      <AssistantPageContent />
    </Suspense>
  )
}
