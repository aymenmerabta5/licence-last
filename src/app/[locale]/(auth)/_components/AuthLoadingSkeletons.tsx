import { Skeleton } from "@/components/ui/skeleton"

export function AuthFormSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>

      <div className="space-y-5">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-11 w-full" />
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  )
}

export function SignupRoleSelectorSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-7">
      <div className="space-y-3">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>

      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-start gap-4 border border-border p-5"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-none" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="mt-1 h-5 w-5 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ResetPasswordVerifySkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>

      <div className="space-y-5">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>

      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-5 w-32" />
    </div>
  )
}
