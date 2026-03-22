import { Skeleton } from "@/components/ui/skeleton"

function VerifyShellSkeleton() {
  return (
    <>
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </header>

      <footer className="border-t border-border/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-28" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </footer>
    </>
  )
}

export function VerifyPageSkeleton() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <VerifyShellSkeleton />
      <div className="mx-auto max-w-2xl space-y-10 px-4 py-20 sm:px-6">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-10 w-52" />
          <Skeleton className="mx-auto h-5 w-full max-w-xl" />
        </div>

        <div className="space-y-6 border border-border/50 p-6 sm:p-8">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </main>
  )
}
