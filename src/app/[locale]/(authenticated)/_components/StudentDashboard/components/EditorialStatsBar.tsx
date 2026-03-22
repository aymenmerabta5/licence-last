"use client"

import * as motion from "motion/react-client"
import type { StudentDashboardStat } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types"
import { reveal, revealWithDelay } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface EditorialStatsBarProps {
  stats: StudentDashboardStat[]
}

export function EditorialStatsBar({ stats }: EditorialStatsBarProps) {
  return (
    <motion.div
      {...reveal}
      transition={revealWithDelay(0.3)}
      className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 bg-background border border-border/80 shadow-[4px_4px_0_0_oklch(var(--border))]"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon

        return (
          <div
            key={stat.title}
            className={cn(
              "relative px-4 py-8 md:px-6 md:py-10 text-center sm:text-start flex flex-col justify-between group overflow-hidden border-border/50 transition-colors duration-500",
              "hover:bg-foreground hover:text-background",
              index < stats.length - 1 && "border-e",
              index < stats.length - 1 &&
                index % 2 === 1 &&
                "max-md:border-none",
              "border-b md:border-b-0",
              index >= stats.length - 2 && "max-md:border-b-0",
            )}
          >
            {/* Hover decorative element */}
            <div className="absolute top-0 end-0 w-8 h-8 bg-primary/10 translate-x-4 -translate-y-4 rounded-full group-hover:scale-[15] transition-transform duration-700 ease-in-out origin-center [[dir=rtl]_&]:-translate-x-4" />

            <div className="relative mb-6 md:mb-10 flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-0 justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50 group-hover:text-background/70 [[dir=rtl]_&]:tracking-normal">
                {stat.title}
              </span>
              <Icon className="h-4 w-4 text-primary group-hover:text-primary-foreground group-hover:animate-pulse" />
            </div>

            <div className="relative space-y-1 sm:space-y-2 mt-auto">
              <h3 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-normal leading-none text-foreground group-hover:text-background tracking-tighter">
                {stat.value}
              </h3>
              <p className="text-[10px] sm:text-xs font-medium text-foreground/40 group-hover:text-background/60 w-full line-clamp-2">
                {stat.description}
              </p>
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}
