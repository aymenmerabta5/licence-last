import { Skeleton } from "@/components/ui/skeleton"

export function VerificationResultSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="p-6 sm:p-10">
        <div className="text-center mb-8 space-y-5">
          <Skeleton className="mx-auto size-24 rounded-full" />
          <Skeleton className="mx-auto h-5 w-24 rounded-none" />
          <div className="space-y-2">
            <Skeleton className="mx-auto h-8 w-3/4 rounded-none" />
            <Skeleton className="mx-auto h-5 w-2/3 rounded-none" />
          </div>
          <Skeleton className="mx-auto h-9 w-40 rounded-md" />
        </div>

        <div className="border-t border-border pt-6 space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 py-3.5 border-b border-border/40 last:border-0"
            >
              <Skeleton className="size-4 rounded-full mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-3 w-20 rounded-none" />
                <Skeleton className="h-5 w-full rounded-none" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center space-y-4">
          <Skeleton className="mx-auto h-3 w-32 rounded-none" />
          <Skeleton className="mx-auto h-9 w-36 rounded-none" />
        </div>
      </div>
    </div>
  )
}
