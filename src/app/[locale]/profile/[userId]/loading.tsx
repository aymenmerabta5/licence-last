import { Skeleton } from "@/components/ui/skeleton"

export default function PublicProfileLoading() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div
        className="mx-auto max-w-5xl space-y-8"
        aria-busy="true"
        aria-live="polite"
      >
        {/* Header skeleton */}
        <div className="border border-border/50">
          <div className="h-0.5 bg-primary" />
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-5">
              <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-full shrink-0" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border border-border/50 bg-card p-5 space-y-2"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-10" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-4">
            <div className="border border-border/50 bg-card overflow-hidden divide-y divide-border/20">
              <div className="h-12 bg-muted/30 px-5 flex items-center">
                <Skeleton className="h-3 w-28" />
              </div>
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-2 w-10" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-border/50 bg-card p-5">
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-6 w-14 rounded-md" />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-10 lg:col-span-8">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-px w-8" />
                  <Skeleton className="h-7 w-28" />
                </div>
                <div className="border border-border/40 bg-card p-8 sm:p-10">
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
