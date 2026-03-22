import { Skeleton } from "@/components/ui/skeleton"

export function VerificationResultSkeleton() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <div className="space-y-6 border border-border/50 p-6 sm:p-8">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <div className="grid gap-4 border-t border-border/50 pt-6 sm:grid-cols-2">
            <Skeleton className="h-20 rounded-none" />
            <Skeleton className="h-20 rounded-none" />
          </div>
        </div>
      </div>

      <footer className="border-t border-border/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-28" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </footer>
    </main>
  )
}
