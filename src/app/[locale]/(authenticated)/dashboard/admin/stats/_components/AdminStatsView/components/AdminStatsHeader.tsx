"use client"

import * as motion from "motion/react-client"
import { Badge } from "@/components/ui/badge"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

export function AdminStatsHeader() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <header className="space-y-4">
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="h-0.5 bg-primary"
      />

      <div className="space-y-3">
        <motion.div {...reveal} transition={revealWithDelay(0.05)}>
          <Badge variant="editorial-muted">Admin Analytics</Badge>
        </motion.div>

        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-2">
            <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight text-heading">
              Platform Statistics
            </h1>
            <p className="text-sm font-light tracking-wide text-muted-foreground max-w-2xl">
              Snapshot of placements, activity, and overall health across the
              Stag platform.
            </p>
          </div>

          <div className="shrink-0 border-s border-border/40 ps-6 hidden md:block">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              {currentDate}
            </span>
          </div>
        </motion.div>
      </div>
    </header>
  )
}
