"use client"

import type { LucideIcon } from "lucide-react"
import * as motion from "motion/react-client"
import { ease } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface StatItem {
  title: string
  value: string
  description: string
  icon: LucideIcon
}

interface ProfileStatsProps {
  stats: StatItem[]
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.15, ease }}
      className="border-y-2 border-foreground dark:border-foreground/15"
    >
      <div className="grid grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          const isHighlight = stat.value === "100%"

          return (
            <div
              key={i}
              className={cn(
                "py-7 px-5 text-center relative group transition-colors",
                "hover:bg-primary/[0.02]",
                i < stats.length - 1 && "border-e border-border/40",
              )}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 [[dir=rtl]_&]:tracking-normal">
                  {stat.title}
                </span>
              </div>
              <h3
                className={cn(
                  "font-serif text-4xl font-bold leading-none tracking-tight",
                  isHighlight ? "text-primary" : "text-heading",
                )}
              >
                {stat.value}
              </h3>
              <p className="text-[10px] text-muted-foreground/40 font-medium mt-2">
                {stat.description}
              </p>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
