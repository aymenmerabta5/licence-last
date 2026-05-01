import { Skeleton } from "@/components/ui/skeleton"

export default function InterviewDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <div className="space-y-3">
        <Skeleton className="h-3 w-32 rounded" />
        <Skeleton className="h-10 w-3/4 rounded" />
        <Skeleton className="h-4 w-48 rounded" />
      </div>
      <Skeleton className="h-40 rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-40 rounded" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  )
}
