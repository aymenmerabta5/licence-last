"use client"

import { ArrowLeft } from "lucide-react"
import * as motion from "motion/react-client"

import type { ValidationHeaderProps } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/types"
import { Link } from "@/i18n/routing"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

export function ValidationHeader({
  isLoading,
  hasApplication,
  studentName,
  companyName,
  backHref,
  backLabel,
  title,
  notFoundLabel,
}: ValidationHeaderProps) {
  return (
    <header className="space-y-6">
      {/* Thin double rule at top — editorial masthead */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="space-y-1"
      >
        <div className="h-px bg-primary/60" />
        <div className="h-px bg-border" />
      </motion.div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-4">
          <motion.div {...reveal} transition={revealWithDelay(0.05)}>
            <Link
              href={backHref as "/dashboard"}
              prefetch={false}
              className="group inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              {backLabel}
            </Link>
          </motion.div>

          <motion.div
            {...reveal}
            transition={revealWithDelay(0.1)}
            className="space-y-2"
          >
            <h1 className="font-serif text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.05] tracking-tight text-heading">
              {title}
            </h1>

            {!isLoading && (
              <p className="text-sm font-light leading-relaxed text-muted-foreground">
                {hasApplication
                  ? [studentName, companyName].filter(Boolean).join(" \u2014 ")
                  : notFoundLabel}
              </p>
            )}
          </motion.div>
        </div>

        {/* File metadata badge */}
        {!isLoading && hasApplication && (
          <motion.div
            {...reveal}
            transition={revealWithDelay(0.15)}
            className="shrink-0"
          >
            <span className="inline-flex items-center border border-border/60 bg-muted/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {studentName} &bull; {companyName}
            </span>
          </motion.div>
        )}
      </div>

      <motion.div
        {...reveal}
        transition={revealWithDelay(0.12)}
        className="h-px bg-border/60"
      />
    </header>
  )
}
