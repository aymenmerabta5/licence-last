"use client"

import { ArrowRight } from "lucide-react"
import * as motion from "motion/react-client"
import type { Route } from "next"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  eyebrow: React.ReactNode
  title: React.ReactNode
  action?: {
    label: string
    href: Route
  }
  delay?: number
  className?: string
}

/**
 * Shared editorial section header used across all role dashboards.
 * border-b-4 + eyebrow + serif title + optional action link.
 */
export function SectionHeader({
  eyebrow,
  title,
  action,
  delay = 0,
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, delay, ease }}
      className={cn(
        "flex flex-col sm:flex-row sm:items-end justify-between border-b-4 border-foreground pb-4",
        className,
      )}
    >
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-2 block">
          {eyebrow}
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-normal tracking-tighter text-foreground mb-4 sm:mb-0">
          {title}
          <span className="text-primary/40 leading-none">.</span>
        </h2>
      </div>
      {action && (
        <Link
          href={action.href}
          prefetch={false}
          className="text-foreground hover:bg-foreground hover:text-background border border-transparent hover:border-foreground transition-all duration-300 font-bold uppercase tracking-[0.15em] text-[10px] py-1 px-3 h-8 flex items-center group/btn"
        >
          {action.label}{" "}
          <ArrowRight className="inline h-3 w-3 ms-2 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      )}
    </motion.div>
  )
}
