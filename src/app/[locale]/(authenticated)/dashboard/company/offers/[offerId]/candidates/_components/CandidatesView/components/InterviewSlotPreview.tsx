"use client"

import { Calendar } from "lucide-react"
import { useTranslations } from "next-intl"

import { formatSchedule } from "@/lib/date"

interface InterviewSlotPreviewProps {
  status: string
  nextSlotStartsAt: string | Date | null
  nextSlotEndsAt: string | Date | null
  slotCount: number
}

export function InterviewSlotPreview({
  status,
  nextSlotStartsAt,
  nextSlotEndsAt,
  slotCount,
}: InterviewSlotPreviewProps) {
  const t = useTranslations("dashboard.company.candidates")

  return (
    <div className="border border-violet-500/15 bg-violet-500/[0.02] p-2.5 space-y-1">
      <div className="flex items-center gap-1.5">
        <Calendar className="h-3 w-3 text-violet-500" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-violet-600 dark:text-violet-400">
          {status === "pending_confirmation"
            ? t("interviewPending")
            : t("interviewConfirmed")}
        </span>
      </div>
      {nextSlotStartsAt && (
        <p className="text-[10px] text-muted-foreground">
          {formatSchedule(nextSlotStartsAt, nextSlotEndsAt ?? nextSlotStartsAt)}
        </p>
      )}
      <p className="text-[10px] text-muted-foreground/60">
        {t("slotCount", { count: slotCount })}
      </p>
    </div>
  )
}
