import { Skeleton } from "@/components/ui/skeleton"

export default function AuthLoading() {
  return (
    <div className="min-h-screen grid place-items-center px-6" aria-busy="true" aria-live="polite">
      <div className="w-full max-w-[420px] space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-72 max-w-full" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  )
}
