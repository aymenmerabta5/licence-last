import { Suspense } from "react"

import { ProfileContent } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent"
import { Skeleton } from "@/components/ui/skeleton"
import { ProfileData } from "./_components/ProfileData"

type Params = Promise<{ userId: string }>

// Fallback UI
function ProfileFallback() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-48 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
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
