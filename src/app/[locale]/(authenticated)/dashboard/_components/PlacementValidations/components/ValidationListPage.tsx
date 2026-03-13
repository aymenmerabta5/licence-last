"use client"

import { Loader2 } from "lucide-react"
import { Link } from "@/i18n/routing"
import { ValidationCard } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/ValidationCard"
import { ValidationEmptyState } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/ValidationEmptyState"
import { ValidationLoadingState } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/ValidationLoadingState"
import type { ValidationListPageProps } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/types"

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
    <div className={`mx-auto space-y-8 ${maxWidthClass}`}>
      <header className="space-y-3">
        <Link
          href={backHref as "/dashboard"}
          className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        >
          {backLabel}
        </Link>
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
            {kicker}
          </p>
          <h1 className="font-serif text-[clamp(2rem,4vw,2.75rem)] leading-tight tracking-tight text-heading">
            {title}
          </h1>
          <p className="max-w-3xl text-sm font-light text-muted-foreground">
            {description}
          </p>
        </div>
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
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
