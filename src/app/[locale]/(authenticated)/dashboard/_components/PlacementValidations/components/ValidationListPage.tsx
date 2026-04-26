"use client"

import { ArrowLeft, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { ValidationCard } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/ValidationCard"
import { ValidationEmptyState } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/ValidationEmptyState"
import { ValidationLoadingState } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/ValidationLoadingState"
import type { ValidationListPageProps } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/types"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/routing"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

export function ValidationListPage({
  applications,
  isLoading,
  isFetchingNextPage,
  sentinelRef,
  backHref,
  backLabel,
  title,
  description,
  kicker,
  emptyLabel,
  detailHref,
  listNamespace,
  maxWidthClass = "max-w-6xl",
}: ValidationListPageProps) {
  if (isLoading) {
    return <ValidationLoadingState maxWidthClass={maxWidthClass} />
  }

  return (
    <div className={`mx-auto space-y-8 pb-16 ${maxWidthClass}`}>
      {/* Editorial masthead */}
      <header className="space-y-4">
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease }}
          className="h-0.5 bg-primary"
        />

        <motion.div {...reveal} transition={revealWithDelay(0.05)}>
          <Link
            href={backHref as "/dashboard"}
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
          <Badge variant="editorial-muted">{kicker}</Badge>
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight text-heading">
            {title}
          </h1>
          <p className="max-w-3xl text-sm font-light text-muted-foreground">
            {description}
          </p>
        </motion.div>
      </header>

      {applications.length === 0 ? (
        <ValidationEmptyState label={emptyLabel} />
      ) : (
        <div className="space-y-3">
          {applications.map((application) => (
            <ValidationCard
              key={application.id}
              application={application}
              href={detailHref(application.id)}
              namespace={listNamespace}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Loading more
          </span>
        </div>
      )}
    </div>
  )
}
