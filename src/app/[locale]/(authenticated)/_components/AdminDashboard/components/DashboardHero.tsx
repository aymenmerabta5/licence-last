"use client"

import * as motion from "motion/react-client"
import { Badge } from "@/components/ui/badge"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

interface DashboardHeroProps {
  isSuperAdmin: boolean
}

export function DashboardHero({ isSuperAdmin }: DashboardHeroProps) {
  const now = new Date()

  return (
    <header className="space-y-4">
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="h-0.5 bg-primary"
      />

      <div className="space-y-3">
        <motion.div {...reveal} transition={revealWithDelay(0.05)}>
          <Badge variant="editorial-muted">
            {isSuperAdmin ? "System" : "University"}
          </Badge>
        </motion.div>

        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-3">
            <p className="text-sm italic text-muted-foreground">
              {isSuperAdmin ? "Global Operations" : "Institutional Oversight"}
            </p>
            <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-tight text-heading max-w-2xl">
              {isSuperAdmin
                ? "Your ecosystem at a glance."
                : "Track, coordinate, and steer your university."}
            </h1>
            <p className="text-sm font-light text-muted-foreground max-w-xl">
              {isSuperAdmin
                ? "Monitor platform health, validate placements, and track institutional progress across the Stag network."
                : "Follow key student and department indicators to run your university internship operations from one place."}
            </p>
          </div>

          <motion.div
            {...reveal}
            transition={revealWithDelay(0.15)}
            className="shrink-0 border-s border-border/40 ps-6 hidden md:block"
          >
            <div className="text-end space-y-1">
              <span className="font-serif text-3xl text-primary leading-none block">
                {now.getDate().toString().padStart(2, "0")}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground block">
                {now.toLocaleString("en-US", { month: "short" })} '
                {now.getFullYear().toString().slice(-2)}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </header>
  )
}
