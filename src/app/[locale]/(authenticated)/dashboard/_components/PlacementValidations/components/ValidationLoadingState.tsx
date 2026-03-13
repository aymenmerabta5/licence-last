"use client"

import { Skeleton } from "@/components/ui/skeleton"

interface ValidationLoadingStateProps {
  maxWidthClass?: string
}

export function ValidationLoadingState({
  maxWidthClass = "max-w-6xl",
}: ValidationLoadingStateProps) {
  return (
    <div className={`mx-auto space-y-6 ${maxWidthClass}`}>
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-[28rem] max-w-full" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  )
}
