"use client"

import * as motion from "motion/react-client"
import { Badge } from "@/components/ui/badge"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

export function SettingsHeader() {
  return (
    <header className="space-y-4">
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="h-0.5 bg-primary"
      />

      <div className="space-y-3">
        <motion.div {...reveal} transition={revealWithDelay(0.05)}>
          <Badge variant="editorial-muted">Account Directory</Badge>
        </motion.div>

        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="space-y-2"
        >
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight text-heading">
            Settings
          </h1>
          <p className="text-sm font-light text-muted-foreground max-w-lg">
            Curate your digital profile, configure security measures, and
            calibrate your ecosystem preferences.
          </p>
        </motion.div>
      </div>
    </header>
  )
}
