import { Suspense } from "react"
import { ProfileData } from "@/app/[locale]/profile/[userId]/_components/ProfileData"
import { Skeleton } from "@/components/ui/skeleton"

type Params = Promise<{ userId: string }>

function ProfileFallback() {
  return (
    <div className="space-y-8">
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
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="border border-border/50 bg-card p-5 space-y-2"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-border/50 bg-card overflow-hidden divide-y divide-border/20">
            <div className="h-12 bg-muted/30 px-5 flex items-center gap-2">
              <Skeleton className="h-3 w-28" />
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <Skeleton className="h-8 w-8 rounded-md" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-2 w-10" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-8 space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary/40" />
              <Skeleton className="h-7 w-24" />
            </div>
            <div className="border border-border/40 bg-card p-8 sm:p-10">
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary/40" />
              <Skeleton className="h-7 w-32" />
            </div>
            <div className="border border-border/40 bg-card p-8 sm:p-10">
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Public profile page with cacheComponents support.
 * Uses Suspense boundary to handle dynamic auth checks.
 */
export default async function PublicProfilePage({
  params,
}: {
  params: Params
}) {
  const { userId } = await params

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <Suspense fallback={<ProfileFallback />}>
          <ProfileData userId={userId} />
        </Suspense>
      </div>
    </main>
  )
}
