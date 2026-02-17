import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { ProfileData } from "@/app/[locale]/profile/[userId]/_components/ProfileData"

type Params = Promise<{ userId: string }>

function ProfileFallback() {
  return (
    <div className="space-y-10">
      {/* Masthead skeleton */}
      <div>
        <Skeleton className="h-0.5 w-full" />
        <div className="border border-t-0 border-border/50 p-8 md:p-10 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex items-end gap-7">
            <Skeleton className="h-32 w-32 rounded-full shrink-0" />
            <div className="flex-1 space-y-4 pb-3">
              <Skeleton className="h-10 w-64" />
              <div className="flex gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-36" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bulletin skeleton */}
      <div className="border-y-2 border-foreground/10">
        <div className="grid grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="py-7 px-5 text-center space-y-3">
              <Skeleton className="h-3 w-16 mx-auto" />
              <Skeleton className="h-10 w-12 mx-auto" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        <div className="lg:col-span-4 space-y-10">
          <div className="space-y-5">
            <Skeleton className="h-px w-full" />
            <div className="border border-border/40 divide-y divide-border/20">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3.5 px-5 py-4">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-2 w-12" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <Skeleton className="h-px w-full" />
            <div className="border border-border/40 p-5">
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-7 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-0.5" />
              <Skeleton className="h-7 w-20" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-0.5" />
              <Skeleton className="h-7 w-28" />
            </div>
            <Skeleton className="h-28 w-full" />
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
export default async function PublicProfilePage({ params }: { params: Params }) {
  const { userId } = await params

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <Suspense fallback={<ProfileFallback />}>
          <ProfileData userId={userId} />
        </Suspense>
      </div>
    </main>
  )
}
