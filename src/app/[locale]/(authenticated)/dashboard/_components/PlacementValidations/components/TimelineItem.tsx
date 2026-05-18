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
    <div className="relative flex items-start gap-4 py-2">
      {/* Dot on the border */}
      <div className="relative flex items-center justify-center">
        <div className="absolute -start-[calc(1.25rem+5px)] h-2.5 w-2.5 rounded-full border-2 border-primary/40 bg-background" />
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground">{formatted}</p>
      </div>
    </div>
  )
}
