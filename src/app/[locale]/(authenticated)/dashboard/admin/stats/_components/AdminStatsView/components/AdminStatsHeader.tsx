"use client"

import * as motion from "motion/react-client"

import { ease } from "@/lib/animations"

export function AdminStatsHeader() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease }}
      className="pb-8 mb-8 border-b border-border"
    >
      <header className="space-y-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
          Admin Analytics
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="font-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-none tracking-tight text-heading">
              Platform Statistics
            </h1>
            <p className="text-muted-foreground text-sm font-light tracking-wide max-w-2xl">
              Snapshot of placements, activity, and overall health across the
              Stag platform.
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center p-4 border-s border-border/40 ps-6 hidden md:block">
            <div className="text-end">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                {currentDate}
              </span>
            </div>
          </div>
        </div>
      </header>
    </motion.div>
  )
}
