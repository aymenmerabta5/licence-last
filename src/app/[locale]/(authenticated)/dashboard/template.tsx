import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"

interface DashboardTemplateProps {
  children: React.ReactNode
}

function DashboardTemplateFallback() {
  return (
    <div className="max-w-7xl mx-auto space-y-10" aria-busy="true" aria-live="polite">
      <header className="space-y-3">
        <Skeleton className="h-3 w-44" />
        <Skeleton className="h-12 w-80 max-w-full" />
        <Skeleton className="h-4 w-[36rem] max-w-full" />
      </header>

      <div className="space-y-8">
        <Skeleton className="h-32 rounded-2xl" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <div className="space-y-6 lg:col-span-4">
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardTemplate({ children }: DashboardTemplateProps) {
  return <Suspense fallback={<DashboardTemplateFallback />}>{children}</Suspense>
}
