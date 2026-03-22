import { Skeleton } from "@/components/ui/skeleton"

export default function AppLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-full max-w-sm space-y-6 text-center">
        <Skeleton className="mx-auto h-8 w-32" />
        <Skeleton className="mx-auto h-4 w-48" />
      </div>
    </div>
  )
}
