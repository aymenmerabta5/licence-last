import { Skeleton } from "@/components/ui/skeleton"

function HeaderSkeleton({
  compact = false,
  width = "w-64",
}: {
  compact?: boolean
  width?: string
}) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className={`h-10 ${width}`} />
      {!compact ? <Skeleton className="h-4 w-full max-w-xl" /> : null}
    </div>
  )
}

function CardStack({
  count,
  height,
}: {
  count: number
  height: string
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className={`${height} rounded-[1.5rem]`} />
      ))}
    </div>
  )
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <HeaderSkeleton width="w-72" />
      <Skeleton className="h-32 rounded-[2rem]" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-[2rem]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Skeleton className="h-64 rounded-[2rem]" />
          <Skeleton className="h-64 rounded-[2rem]" />
        </div>
        <div className="space-y-6 lg:col-span-4">
          <Skeleton className="h-64 rounded-[2rem]" />
        </div>
      </div>
    </div>
  )
}

export function AssistantPageSkeleton() {
  return (
    <div className="flex min-h-[500px] flex-col" style={{ height: "calc(100vh - 12rem)" }}>
      <div className="space-y-3 border-b border-border/50 pb-5">
        <HeaderSkeleton width="w-64" />
      </div>
      <div className="flex min-h-0 flex-1 flex-row gap-6 pt-6">
        <div className="hidden w-[320px] shrink-0 lg:block">
          <Skeleton className="h-full rounded-none border border-border/60" />
        </div>
        <div className="flex-1 rounded-none border border-border/60 bg-card/40 p-4 sm:p-5">
          <CardStack count={4} height="h-28" />
        </div>
      </div>
    </div>
  )
}

export function PipelinePageSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <HeaderSkeleton compact width="w-72" />
      <div className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-4 rounded-[1.5rem] border border-border/50 p-4">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-28 rounded-[1rem]" />
            <Skeleton className="h-28 rounded-[1rem]" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CandidatesPageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <HeaderSkeleton compact width="w-80" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-[1.5rem]" />
        ))}
      </div>
      <CardStack count={3} height="h-44" />
    </div>
  )
}

export function ListManagementSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-16">
      <HeaderSkeleton width="w-72" />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full sm:w-32" />
        <Skeleton className="h-10 w-full sm:w-32" />
      </div>
      <CardStack count={3} height="h-40" />
    </div>
  )
}

export function DocumentsPageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <HeaderSkeleton compact width="w-56" />
      <CardStack count={3} height="h-40" />
    </div>
  )
}

export function OffersPageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <HeaderSkeleton compact width="w-48" />
        <Skeleton className="h-11 w-full sm:w-36" />
      </div>
      <Skeleton className="h-20 rounded-[1.5rem]" />
      <CardStack count={2} height="h-56" />
    </div>
  )
}

export function FormPageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <Skeleton className="h-40 rounded-[2rem]" />
      <CardStack count={3} height="h-44" />
    </div>
  )
}

export function TeamPageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <HeaderSkeleton compact width="w-64" />
      <Skeleton className="h-44 rounded-[1.5rem]" />
      <CardStack count={3} height="h-24" />
    </div>
  )
}

export function ExplorePageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <HeaderSkeleton width="w-72" />
      <div className="flex flex-col gap-3 lg:flex-row">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 w-full lg:w-48" />
      </div>
      <Skeleton className="h-44 rounded-[1.5rem]" />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-[1.5rem]" />
        ))}
      </div>
    </div>
  )
}

export function DirectoryPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <HeaderSkeleton width="w-80" />
      <div className="flex flex-col gap-3 lg:flex-row">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 w-full lg:w-48" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-48 rounded-[1.5rem]" />
        ))}
      </div>
    </div>
  )
}

export function OfferDetailPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-20">
      <Skeleton className="h-48 rounded-[2rem]" />
      <div className="grid grid-cols-1 gap-8 border-t-2 border-border/80 pt-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8 lg:pe-12">
          <Skeleton className="h-64 rounded-[1.5rem]" />
          <Skeleton className="h-72 rounded-[1.5rem]" />
        </div>
        <div className="space-y-8 lg:col-span-4 lg:ps-12">
          <Skeleton className="h-56 rounded-[1.5rem]" />
          <Skeleton className="h-48 rounded-[1.5rem]" />
          <Skeleton className="h-48 rounded-[1.5rem]" />
        </div>
      </div>
    </div>
  )
}

export function InterviewsPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <HeaderSkeleton width="w-64" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Skeleton className="h-[520px] rounded-[1.5rem]" />
        <Skeleton className="h-[520px] rounded-[1.5rem]" />
      </div>
    </div>
  )
}

export function MessagesPageSkeleton() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton compact width="w-56" />
      <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Skeleton className="h-[620px] rounded-[1.5rem]" />
        <Skeleton className="h-[620px] rounded-[1.5rem]" />
      </div>
    </div>
  )
}

export function NotificationsPageSkeleton() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton compact width="w-64" />
      <Skeleton className="h-36 rounded-[1.5rem]" />
      <CardStack count={4} height="h-28" />
    </div>
  )
}

export function SavedOffersPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <HeaderSkeleton compact width="w-64" />
      <CardStack count={3} height="h-40" />
      <div className="flex justify-center">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

export function StatsPageSkeleton() {
  return (
    <div className="space-y-10">
      <HeaderSkeleton width="w-72" />
      <div className="grid gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-[1.5rem]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <Skeleton className="h-[420px] rounded-[1.5rem] lg:col-span-7" />
        <Skeleton className="h-[420px] rounded-[1.5rem] lg:col-span-5" />
      </div>
    </div>
  )
}

export function PlacementDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <HeaderSkeleton compact width="w-72" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-[1.5rem]" />
        <Skeleton className="h-96 rounded-[1.5rem]" />
        <Skeleton className="h-72 rounded-[1.5rem] lg:col-span-2" />
      </div>
    </div>
  )
}

export function SettingsPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-24">
      <Skeleton className="h-48 rounded-[2.5rem] sm:h-52" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-3">
          <div className="space-y-1 rounded-[2rem] border border-border/30 bg-background/60 p-3">
            <Skeleton className="mb-4 ms-4 mt-3 h-3 w-24" />
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-4 py-3.5">
                <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2.5">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-2.5 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-8 lg:col-span-9">
          <Skeleton className="h-[500px] rounded-[2.5rem]" />
          <Skeleton className="h-[300px] rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  )
}
