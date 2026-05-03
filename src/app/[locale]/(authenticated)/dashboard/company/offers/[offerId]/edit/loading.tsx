import { Skeleton } from "@/components/ui/skeleton"

export default function EditOfferLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <header className="space-y-4">
        <Skeleton className="h-0.5 w-full max-w-xs" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </header>
      <div className="max-w-3xl">
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}
