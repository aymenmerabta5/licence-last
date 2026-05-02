import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSettingsTabSkeleton() {
  return (
    <div className="space-y-8">
      {/* Profile Identity header card */}
      <div className="overflow-hidden border border-border/60 bg-card/30 dark:bg-card/50">
        <div className="flex items-center gap-2.5 border-b border-border/40 bg-muted/20 px-6 py-4 dark:bg-muted/10">
          <Skeleton className="h-4 w-4 shrink-0 rounded-none" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="px-6 py-4">
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </div>

      {/* Avatar card */}
      <div className="border border-border/60 bg-card/30 dark:bg-card/50 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
          <Skeleton className="h-28 w-28 sm:h-32 sm:w-32 shrink-0 rounded-none" />
          <div className="space-y-3 min-w-0 flex-1">
            <div className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-40" />
              <Skeleton className="h-2.5 w-28" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-28 rounded-none" />
              <Skeleton className="h-9 w-24 rounded-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-4 w-0.5 rounded-none" />
          <Skeleton className="h-2.5 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>

      {/* Academic Info section */}
      <div className="space-y-5">
        <div className="flex items-center gap-6 py-4">
          <div className="h-px flex-1 bg-border/20" />
          <Skeleton className="h-6 w-32 rounded-full" />
          <div className="h-px flex-1 bg-border/20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>

      {/* Location section */}
      <div className="space-y-5">
        <div className="flex items-center gap-6 py-4">
          <div className="h-px flex-1 bg-border/20" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <div className="h-px flex-1 bg-border/20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>

      {/* Web Presence section */}
      <div className="space-y-5">
        <div className="flex items-center gap-6 py-4">
          <div className="h-px flex-1 bg-border/20" />
          <Skeleton className="h-6 w-36 rounded-full" />
          <div className="h-px flex-1 bg-border/20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>

      {/* Bio section */}
      <div className="space-y-5">
        <div className="flex items-center gap-6 py-4">
          <div className="h-px flex-1 bg-border/20" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <div className="h-px flex-1 bg-border/20" />
        </div>
        <Skeleton className="h-[140px] w-full rounded-xl" />
      </div>

      {/* Form actions */}
      <div className="flex flex-col gap-4 border-t border-border/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-48 rounded-none hidden sm:block" />
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Skeleton className="h-10 w-full sm:w-24 rounded-none" />
          <Skeleton className="h-10 w-full sm:w-32 rounded-none" />
        </div>
      </div>
    </div>
  )
}
