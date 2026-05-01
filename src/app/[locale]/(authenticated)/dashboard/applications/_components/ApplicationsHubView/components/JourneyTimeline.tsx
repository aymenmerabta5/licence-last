"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface JourneyTimelineProps {
  currentStage: string
  stages: string[]
  stageLabels: Record<string, string>
}

export function JourneyTimeline({ currentStage, stages, stageLabels }: JourneyTimelineProps) {
  const currentIndex = stages.indexOf(currentStage)

  return (
    <div className="py-4">
      <div className="relative flex items-start justify-between">
        <div className="absolute top-[11px] start-4 end-4 h-px bg-border" />
        {stages.map((stage, index) => {
          const isPast = index < currentIndex
          const isCurrent = index === currentIndex
          const isFuture = index > currentIndex

          return (
            <div key={stage} className="relative z-10 flex flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center rounded-full border-2 transition-colors",
                  isPast && "h-5 w-5 border-primary bg-primary text-primary-foreground",
                  isCurrent && "h-6 w-6 border-primary bg-primary text-primary-foreground",
                  isFuture && "h-5 w-5 border-border bg-background",
                )}
              >
                {isPast && <Check className="h-3 w-3" />}
                {isCurrent && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
              </div>
              <span
                className={cn(
                  "max-w-[80px] text-center text-[10px] font-bold uppercase tracking-[0.1em]",
                  isCurrent ? "text-primary" : "text-muted-foreground",
                )}
              >
                {stageLabels[stage] ?? stage}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
