"use client"

import { useLocale, useTranslations } from "next-intl"

import { formatDate } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/utils"

interface TimelineItemProps {
  label: string
  date: Date | string | null | undefined
}

export function TimelineItem({ label, date }: TimelineItemProps) {
  const locale = useLocale()
  const t = useTranslations("dashboard.admin.validations.detail")
  const formatted = formatDate(date ?? null, locale, t("notAvailable"))

  return (
    <div className="relative flex gap-3">
      <div className="flex flex-col items-center gap-1">
        <div className="h-2 w-2 rounded-full bg-primary/60" />
        <div className="w-px flex-1 bg-border/60" />
      </div>
      <div className="pb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </p>
        <p className="text-sm text-foreground">{formatted}</p>
      </div>
    </div>
  )
}
