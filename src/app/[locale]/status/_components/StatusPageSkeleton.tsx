import { Skeleton } from "@/components/ui/skeleton"

export function StatusContentSkeleton() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-12 w-full max-w-xl" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      <Skeleton className="h-px w-full rounded-none" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-28 rounded-none" />
        <Skeleton className="h-28 rounded-none" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-12 w-full sm:w-40" />
        <Skeleton className="h-12 w-full sm:w-40" />
      </div>
    </div>
  )
}

export function StatusPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-500 ease-in-out">
      <header className="flex items-center justify-between px-6 py-5 lg:px-10 lg:py-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-12 lg:px-10">
        <div className="w-full max-w-3xl">
          <StatusContentSkeleton />
        </div>
      </main>
    </div>
  )
}
