"use client"

import * as motion from "motion/react-client"
import { ease, reveal, revealWithDelay } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface MastheadProps {
  badge: React.ReactNode
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  rightSlot?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

/**
 * Shared editorial masthead used across all role dashboards.
 * Enforces the horizontal rule, badge, serif title + description pattern.
 */
export function DashboardMasthead({
  badge,
  eyebrow,
  title,
  description,
  rightSlot,
  actions,
  className,
}: MastheadProps) {
  return (
    <header className={cn("space-y-3 sm:space-y-4", className)}>
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="h-0.5 bg-primary"
      />

      <div className="space-y-2.5 sm:space-y-3">
        <motion.div {...reveal} transition={revealWithDelay(0.05)}>
          {badge}
        </motion.div>

        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6"
        >
          <div className="space-y-2 sm:space-y-3">
            {eyebrow && (
              <p className="text-[13px] sm:text-sm italic text-muted-foreground">
                {eyebrow}
              </p>
            )}
            <h1 className="max-w-2xl font-serif text-[clamp(1.9rem,8vw,3rem)] leading-[1.05] tracking-tight text-heading">
              {title}
            </h1>
            {description && (
              <p className="max-w-xl text-[13px] sm:text-sm font-light text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          {rightSlot && (
            <motion.div
              {...reveal}
              transition={revealWithDelay(0.15)}
              className="shrink-0 border-s border-border/40 ps-6 hidden md:flex flex-col gap-4"
            >
              <DateWidget />
              {rightSlot}
            </motion.div>
          )}

          {!rightSlot && (
            <motion.div
              {...reveal}
              transition={revealWithDelay(0.15)}
              className="shrink-0 border-s border-border/40 ps-6 hidden md:flex flex-col gap-4"
            >
              <DateWidget />
            </motion.div>
          )}
        </motion.div>

        {actions && (
          <motion.div
            {...reveal}
            transition={revealWithDelay(0.2)}
            className="flex flex-wrap gap-3 pt-2"
          >
            {actions}
          </motion.div>
        )}
      </div>
    </header>
  )
}

function DateWidget() {
  const now = new Date()
  return (
    <div className="text-end space-y-1">
      <span className="font-serif text-3xl text-primary leading-none block">
        {now.getDate().toString().padStart(2, "0")}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground block">
        {now.toLocaleString("en-US", { month: "short" })} '
        {now.getFullYear().toString().slice(-2)}
      </span>
    </div>
  )
}
