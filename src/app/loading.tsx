import { Skeleton } from "@/components/ui/skeleton"

export default function AppLoading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-full max-w-3xl space-y-4">
        <Skeleton className="h-3 w-40 mx-auto" />
        <Skeleton className="h-12 w-72 mx-auto" />
      </div>
    </div>
  )
}
