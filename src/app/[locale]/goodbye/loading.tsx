import { Skeleton } from "@/components/ui/skeleton"

export default function GoodbyeLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 text-foreground">
      <div
        className="flex max-w-md flex-col items-center text-center"
        aria-busy="true"
        aria-live="polite"
      >
        <Skeleton className="mb-8 h-3 w-12" />
        <Skeleton className="mb-4 h-10 w-64" />
        <Skeleton className="mb-6 h-px w-full max-w-xs rounded-none" />
        <Skeleton className="mb-10 h-4 w-full max-w-sm" />
        <Skeleton className="h-12 w-40" />
      </div>
    </main>
  )
}
