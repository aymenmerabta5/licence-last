import { Skeleton } from "@/components/ui/skeleton"

function PublicNavbarSkeleton() {
  return (
    <header className="border-b border-border/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-32" />
        <div className="hidden items-center gap-3 md:flex">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </header>
  )
}

function RibbonSkeleton() {
  return <Skeleton className="h-12 w-full rounded-none border-y border-border/50" />
}

function PublicFooterSkeleton() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3 lg:col-span-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-3/4 max-w-sm" />
        </div>
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </footer>
  )
}

export function HomePageSkeleton() {
  return (
    <main className="min-h-screen overflow-x-clip bg-background text-foreground">
      <PublicNavbarSkeleton />
      <RibbonSkeleton />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-20">
        <div className="space-y-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-16 w-full max-w-2xl" />
          <Skeleton className="h-16 w-5/6 max-w-xl" />
          <Skeleton className="h-5 w-full max-w-xl" />
          <Skeleton className="h-5 w-4/5 max-w-lg" />
          <div className="flex flex-wrap gap-3 pt-2">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-36" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Skeleton className="h-52 rounded-[2rem]" />
          <Skeleton className="h-52 rounded-[2rem]" />
        </div>
      </section>

      <section className="border-y border-border/50">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-none" />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full max-w-xl" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-4 border border-border/50 p-6">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>
      </section>

      <PublicFooterSkeleton />
    </main>
  )
}

export function PublicEditorialPageSkeleton() {
  return (
    <main className="min-h-screen overflow-x-clip bg-background text-foreground">
      <PublicNavbarSkeleton />
      <RibbonSkeleton />

      <section className="mx-auto max-w-7xl space-y-10 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="space-y-5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-14 w-full max-w-3xl" />
          <Skeleton className="h-14 w-4/5 max-w-2xl" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-none" />
          ))}
        </div>

        <div className="space-y-6 border-t border-border/50 pt-10">
          <Skeleton className="h-10 w-56" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-72 rounded-none" />
            <div className="space-y-4">
              <Skeleton className="h-24 rounded-none" />
              <Skeleton className="h-24 rounded-none" />
              <Skeleton className="h-24 rounded-none" />
            </div>
          </div>
        </div>
      </section>

      <PublicFooterSkeleton />
    </main>
  )
}
