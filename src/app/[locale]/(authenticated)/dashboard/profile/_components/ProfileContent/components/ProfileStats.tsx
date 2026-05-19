"use client"

import type { LucideIcon } from "lucide-react"
import * as motion from "motion/react-client"
import { ease, fadeIn, reveal } from "@/lib/animations"

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
      {...fadeIn}
      transition={{ duration: 0.6, delay: 0.15, ease }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
    >
      {stats.map((stat, i) => {
        const Icon = stat.icon
        const isHighlight = stat.value.includes("%")
        const percentage = isHighlight ? parseInt(stat.value, 10) : 0

        return (
          <motion.div
            key={i}
            {...reveal}
            transition={{ delay: 0.25 + i * 0.08, duration: 0.5, ease }}
            className="border border-border/50 bg-card p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                <Icon className="h-3.5 w-3.5 text-primary" />
                {stat.title}
              </div>
            </div>

            <div className="font-serif text-3xl text-heading tracking-tight">
              {stat.value}
            </div>

            {isHighlight ? (
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-muted rounded-sm overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                      duration: 1.2,
                      delay: 0.4,
                      ease: "circOut",
                    }}
                    className="h-full bg-primary rounded-sm"
                  />
                </div>
                <p className="text-[11px] font-bold text-primary/70 uppercase tracking-wider">
                  {stat.description}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                {stat.description}
              </p>
            )}
          </motion.div>
        )
      })}
    </motion.div>
  )
}
