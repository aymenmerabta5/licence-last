import { Skeleton } from "@/components/ui/skeleton"

export default function AuthenticatedLoading() {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-10" aria-busy="true" aria-live="polite">
      <Skeleton className="h-10 w-64" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <div className="space-y-6 lg:col-span-4">
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
