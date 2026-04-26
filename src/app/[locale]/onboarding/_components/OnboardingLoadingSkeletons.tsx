import { Skeleton } from "@/components/ui/skeleton"

export function DecorativePanelSkeleton() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden border-e border-border/50 bg-sidebar px-8 py-16 text-sidebar-foreground">
      <Skeleton className="h-10 w-10 rounded-none" />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Skeleton className="mb-12 h-8 w-32" />
        <Skeleton className="h-16 w-16 rounded-none" />
        <Skeleton className="mt-10 h-12 w-64" />
        <Skeleton className="mt-5 h-4 w-72" />
        <div className="mt-10 w-full max-w-[300px] space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3">
              <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MobileHeroBannerSkeleton() {
  return (
    <div className="mb-12 border-y border-border/60 bg-background py-8">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-none" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-px flex-1 rounded-none" />
      </div>
    </div>
  )
}

export function OnboardingFormSkeleton({ sections }: { sections: number[] }) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="space-y-12 lg:space-y-16"
    >
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      {sections.map((fieldCount, sectionIndex) => (
        <div key={sectionIndex} className="space-y-4">
          <Skeleton className="h-4 w-40" />
          <div className="space-y-3">
            {Array.from({ length: fieldCount }).map((_, fieldIndex) => (
              <Skeleton key={fieldIndex} className="h-11 w-full" />
            ))}
          </div>
        </div>
      ))}

      <Skeleton className="h-12 w-full" />
    </div>
  )
}
