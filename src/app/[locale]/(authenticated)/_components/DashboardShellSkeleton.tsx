import { Skeleton } from "@/components/ui/skeleton"

export function DashboardShellSkeleton() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden h-screen w-[260px] shrink-0 border-e border-border bg-background lg:block">
        <div className="space-y-6 p-5">
          <Skeleton className="h-10 w-28" />
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background">
          <div className="flex h-24 items-center justify-between px-4 sm:px-8 lg:px-12">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl lg:hidden" />
              <Skeleton className="h-9 w-40" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
          <div className="mx-auto w-full max-w-7xl space-y-10 pb-10">
            {/* Editorial header skeleton */}
            <header className="space-y-3">
              <Skeleton className="h-12 w-3/4 max-w-lg" />
              <Skeleton className="h-4 w-full max-w-xl" />
            </header>

            {/* Hero / banner placeholder */}
            <Skeleton className="h-40 rounded-[2rem]" />

            {/* Stats row */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-[2rem]" />
              ))}
            </div>

            {/* Two-column content */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-8">
                <Skeleton className="h-64 rounded-[2rem]" />
                <Skeleton className="h-64 rounded-[2rem]" />
              </div>
              <div className="space-y-6 lg:col-span-4">
                <Skeleton className="h-64 rounded-[2rem]" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
