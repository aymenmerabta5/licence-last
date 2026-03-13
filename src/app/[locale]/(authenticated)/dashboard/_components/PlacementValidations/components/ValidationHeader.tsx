"use client"

import { ChevronLeft } from "lucide-react"
import { Link } from "@/i18n/routing"
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
    <header className="space-y-3">
      <Link
        href={backHref as "/dashboard"}
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <h1 className="font-serif text-[clamp(2rem,4vw,2.75rem)] leading-tight tracking-tight text-heading">
        {title}
      </h1>

      {!isLoading && (
        <p className="text-sm font-light text-muted-foreground">
          {hasApplication
            ? [studentName, companyName].filter(Boolean).join(" • ")
            : notFoundLabel}
        </p>
      )}
    </header>
  )
}
