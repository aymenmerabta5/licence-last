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
      className="grid grid-cols-3 gap-4"
    >
      {stats.map((stat, i) => {
        const Icon = stat.icon
        const isHighlight = stat.value === "100%"

        return (
          <div
            key={i}
            className="border border-border/60 bg-card/30 dark:bg-card/50 p-5"
          >
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {stat.title}
              </span>
              <Icon
                className={cn(
                  "h-4 w-4",
                  isHighlight
                    ? "text-primary"
                    : "text-muted-foreground/50",
                )}
              />
            </div>
            <div
              className={cn(
                "mt-2 font-serif text-3xl tracking-tight",
                isHighlight ? "text-primary" : "text-heading",
              )}
            >
              {stat.value}
            </div>
            <p className="text-[10px] text-muted-foreground/50 font-medium mt-1">
              {stat.description}
            </p>
          </div>
        )
      })}
    </motion.div>
  )
}
