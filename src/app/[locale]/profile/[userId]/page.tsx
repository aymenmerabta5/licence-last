import { Suspense } from "react"
import { ProfileBackground } from "@/app/[locale]/profile/[userId]/_components/ProfileBackground"
import { ProfileData } from "@/app/[locale]/profile/[userId]/_components/ProfileData"
import { Skeleton } from "@/components/ui/skeleton"

type Params = Promise<{ userId: string }>

function ProfileFallback() {
  return (
    <div className="space-y-10">
      {/* Hero header skeleton */}
      <div className="h-64 sm:h-72 w-full rounded-2xl bg-muted/30 animate-pulse relative overflow-hidden">
        <div className="absolute bottom-8 start-6 sm:start-10 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-muted/40 shrink-0" />
          <div className="space-y-4 pb-1 flex-1">
            <Skeleton className="h-10 w-64 bg-muted/40" />
            <div className="flex gap-3">
              <Skeleton className="h-6 w-20 rounded-full bg-muted/40" />
              <Skeleton className="h-6 w-36 bg-muted/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card/40 p-5 space-y-3"
          >
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-10 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-12 2xl:gap-16">
        <div className="xl:col-span-3 space-y-8">
          <div className="rounded-[2rem] border border-border/50 bg-card/40 overflow-hidden divide-y divide-border/20">
            <div className="h-14 bg-muted/20 px-6 flex items-center gap-2.5">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-24" />
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-2 w-12" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="xl:col-span-9 space-y-14">
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="h-6 w-1 rounded-full bg-primary/40" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="rounded-[2.5rem] border border-border/40 bg-card/40 p-10 sm:p-16">
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="h-6 w-1 rounded-full bg-primary/40" />
              <Skeleton className="h-8 w-40" />
            </div>
            <div className="rounded-[2.5rem] border border-border/40 bg-card/40 p-10 sm:p-16">
              <Skeleton className="h-28 w-full" />
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
    <main className="min-h-screen bg-[#faf9f6] text-foreground relative overflow-hidden transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <ProfileBackground />

      <div className="relative max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 2xl:px-16 py-10 lg:py-16">
        <Suspense fallback={<ProfileFallback />}>
          <ProfileData userId={userId} />
        </Suspense>
      </div>
    </main>
  )
}
