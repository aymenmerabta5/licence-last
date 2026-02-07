"use client"

import * as motion from "motion/react-client"
import { Star } from "lucide-react"

const MARQUEE_ITEMS = [
  "INTERNSHIP MATCHING",
  "DIGITAL CV",
  "SMART FILTERS",
  "AUTO DOCUMENTS",
  "SKILL TAGS",
  "REAL-TIME TRACKING",
]

export function MarqueeRibbon() {
  return (
    <div
      className="overflow-hidden py-3 bg-secondary dark:bg-primary transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
      aria-label="Feature highlights"
    >
      <motion.div
        className="flex w-max whitespace-nowrap gap-12 will-change-transform"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 25, ease: "linear", repeat: Infinity }}
      >
        {[...Array(2)].map((_, setIdx) => (
          <div key={setIdx} className="flex items-center gap-12 shrink-0">
            {MARQUEE_ITEMS.map((txt, i) => (
              <span key={i} className="flex items-center gap-3">
                <Star
                  className="h-3 w-3 text-primary dark:text-primary-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold tracking-[0.2em] text-secondary-foreground dark:text-primary-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                  {txt}
                </span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
