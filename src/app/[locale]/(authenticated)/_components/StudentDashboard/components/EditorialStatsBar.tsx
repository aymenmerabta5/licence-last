"use client"

import * as motion from "motion/react-client"

import { reveal, revealWithDelay } from "@/lib/animations"
import { cn } from "@/lib/utils"

import type { StudentDashboardStat } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types"

interface EditorialStatsBarProps {
  stats: StudentDashboardStat[]
}

export function EditorialStatsBar({ stats }: EditorialStatsBarProps) {
  return (
    <motion.div
      {...reveal}
      transition={revealWithDelay(0.2)}
      className="grid grid-cols-1 border-y-2 border-foreground dark:border-foreground/15 sm:grid-cols-5"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon

        return (
          <div
            key={stat.title}
            className={cn(
              "px-6 py-7 text-center",
              index < stats.length - 1 && "border-b border-border sm:border-e sm:border-b-0",
            )}
          >
            <div className="mb-3 flex items-center justify-center gap-2">
              <Icon className="h-3.5 w-3.5 text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 [[dir=rtl]_&]:tracking-normal">
                {stat.title}
              </span>
            </div>
            <h3 className="font-serif text-4xl font-bold leading-none text-heading">
              {stat.value}
            </h3>
            <p className="mt-2 text-[10px] font-medium text-muted-foreground/40">
              {stat.description}
            </p>
          </div>
        )
      })}
    </motion.div>
  )
}
