import { Skeleton } from "@/components/ui/skeleton"

export function CompanyPublicProfileSkeleton() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-4 border border-border/50 p-6 md:p-8">
          <Skeleton className="h-3 w-32" />
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-none" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-10 w-56" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-36" />
          </div>
        </header>

        <section className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <div className="space-y-3">
            <Skeleton className="h-24 rounded-none" />
            <Skeleton className="h-24 rounded-none" />
            <Skeleton className="h-24 rounded-none" />
          </div>
        </section>
      </div>
    </main>
  )
}
