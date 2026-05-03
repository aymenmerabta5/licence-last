import { Skeleton } from "@/components/ui/skeleton"

export default function SiteSettingsLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-16">
      <div className="space-y-4">
        <Skeleton className="h-0.5 w-full max-w-xs" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
      </div>
      <Skeleton className="h-64 rounded-[1.5rem]" />
      <Skeleton className="h-64 rounded-[1.5rem]" />
    </div>
  )
}
