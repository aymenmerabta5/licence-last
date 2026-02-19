"use client"

import { PenLine } from "lucide-react"
import { useTranslations } from "next-intl"

export function ApplicationSectionDivider() {
  const t = useTranslations("dashboard.offerDetail")

  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border/30" />
      <PenLine className="h-3.5 w-3.5 text-muted-foreground/60" />
      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
        {t("application")}
      </span>
      <div className="h-px flex-1 bg-border/30" />
    </div>
  )
}
