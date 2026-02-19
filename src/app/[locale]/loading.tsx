import { Skeleton } from "@/components/ui/skeleton"

export default function LocaleLoading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-full max-w-4xl space-y-6">
        <Skeleton className="h-3 w-44 mx-auto" />
        <Skeleton className="h-12 w-80 max-w-full mx-auto" />
        <Skeleton className="h-4 w-xl max-w-full mx-auto" />
      </div>
    </div>
  )
}
