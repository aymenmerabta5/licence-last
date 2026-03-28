"use client"

import { ArrowLeft } from "lucide-react"
import { Link } from "@/i18n/routing"
import { Badge } from "@/components/ui/badge"
import type { ValidationHeaderProps } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/types"

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
      <div className="h-0.5 bg-primary" />

      <Link
        href={backHref as "/dashboard"}
        className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        {backLabel}
      </Link>

      <div className="space-y-3">
        <Badge variant="editorial-muted">Validation Detail</Badge>
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
      </div>
    </header>
  )
}
