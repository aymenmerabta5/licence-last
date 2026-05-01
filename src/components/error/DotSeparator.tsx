"use client"

import * as motion from "motion/react-client"
import { ease, reveal } from "@/lib/animations"

interface DotSeparatorProps {
  lineWidth?: number
  delay?: number
}

export function DotSeparator({ lineWidth = 40, delay = 0 }: DotSeparatorProps) {
  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.7, ease, delay }}
      className="flex items-center justify-center gap-4"
      aria-hidden="true"
    >
      <span
        className="h-px bg-foreground/15 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ width: lineWidth }}
      />
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      <span
        className="h-px bg-foreground/15 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ width: lineWidth }}
      />
    </motion.div>
  )
}
