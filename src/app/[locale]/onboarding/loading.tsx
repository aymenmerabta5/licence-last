import { Skeleton } from "@/components/ui/skeleton"

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen grid place-items-center px-6" aria-busy="true" aria-live="polite">
      <div className="w-full max-w-[520px] space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  )
}
