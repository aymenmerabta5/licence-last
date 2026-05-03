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
    <header className="space-y-4">
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="h-0.5 bg-primary"
      />

      <motion.div {...reveal} transition={revealWithDelay(0.05)}>
        <Link
          href={backHref as "/dashboard"}
          prefetch={false}
          className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          {backLabel}
        </Link>
      </motion.div>

      <motion.div
        {...reveal}
        transition={revealWithDelay(0.1)}
        className="space-y-3"
      >
        <h1 className="font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight text-heading">
          {title}
        </h1>

        {!isLoading && (
          <p className="text-sm font-light text-muted-foreground">
            {hasApplication
              ? [studentName, companyName].filter(Boolean).join(" — ")
              : notFoundLabel}
          </p>
        )}
      </motion.div>
    </header>
  )
}
