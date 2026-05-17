"use client"

import { ClipboardCheck } from "lucide-react"
import { useTranslations } from "next-intl"

interface ValidationEmptyStateProps {
  label: string
}

export function ValidationEmptyState({ label }: ValidationEmptyStateProps) {
  const t = useTranslations("dashboard.placementValidations")
  return (
    <div className="border border-dashed border-border/60 p-12 text-center space-y-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border/50 bg-muted/30">
        <ClipboardCheck className="h-6 w-6 text-muted-foreground/40" />
      </div>
      <div className="space-y-1">
        <p className="font-serif text-lg text-heading">
          {t("noValidationsTitle")}
        </p>
        <p className="text-sm font-light text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
