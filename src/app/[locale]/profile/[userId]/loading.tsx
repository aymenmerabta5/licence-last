import { Skeleton } from "@/components/ui/skeleton"

export default function PublicProfileLoading() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-10">
      <div
        className="mx-auto max-w-7xl space-y-10"
        aria-busy="true"
        aria-live="polite"
      >
        <div>
          <Skeleton className="h-0.5 w-full rounded-none" />
          <div className="space-y-6 border border-t-0 border-border/50 p-8 md:p-10">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex flex-col gap-7 md:flex-row md:items-end">
              <Skeleton className="h-32 w-32 shrink-0 rounded-full" />
              <div className="flex-1 space-y-4 pb-3">
                <Skeleton className="h-10 w-64" />
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-36 rounded-full" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-y-2 border-foreground/10">
          <div className="grid grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-3 px-5 py-7 text-center">
                <Skeleton className="mx-auto h-3 w-16" />
                <Skeleton className="mx-auto h-10 w-12" />
                <Skeleton className="mx-auto h-3 w-20" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-10 lg:col-span-4">
            <div className="space-y-5">
              <Skeleton className="h-px w-full rounded-none" />
              <div className="divide-y divide-border/20 border border-border/40">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3.5 px-5 py-4">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-2 w-12" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <Skeleton className="h-px w-full rounded-none" />
              <div className="border border-border/40 p-5">
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-7 w-16 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-12 lg:col-span-8">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="space-y-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-0.5 rounded-none" />
                  <Skeleton className="h-7 w-28" />
                </div>
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
