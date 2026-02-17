import { Skeleton } from "@/components/ui/skeleton"

export default function OnboardingLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Section skeleton */}
      <div className="space-y-4 pt-2">
        <Skeleton className="h-3 w-40" />
        <div className="space-y-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>

      {/* Second section skeleton */}
      <div className="space-y-4 pt-2">
        <Skeleton className="h-3 w-32" />
        <div className="space-y-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>

      {/* Button skeleton */}
      <Skeleton className="h-12 w-full mt-4" />
    </div>
  )
}
