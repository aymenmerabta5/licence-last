"use client"

import { CalendarDays, LinkIcon, MapPin } from "lucide-react"
import { useTranslations } from "next-intl"
import type { CompanyInterviewView } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { formatSchedule } from "@/lib/date"
import { cn } from "@/lib/utils"

interface InterviewSlotListProps {
  slots: CompanyInterviewView["slots"]
  confirmedSlotId: string | null
}

export function InterviewSlotList({
  slots,
  confirmedSlotId,
}: InterviewSlotListProps) {
  const t = useTranslations("dashboard.interviews")

  return (
    <div className="space-y-2 p-5">
      {slots.map((slot) => {
        const isConfirmedSlot = confirmedSlotId === slot.id

        return (
          <div
            key={slot.id}
            className={cn(
              "flex items-center justify-between gap-3 px-3 py-2.5 text-sm transition-colors",
              isConfirmedSlot
                ? "border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10"
                : "border border-border/40 hover:border-border",
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              <CalendarDays
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  isConfirmedSlot
                    ? "text-emerald-500 dark:text-emerald-400"
                    : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "truncate text-xs",
                  isConfirmedSlot
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {formatSchedule(slot.startsAt, slot.endsAt)}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {slot.location && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="hidden sm:inline">{slot.location}</span>
                </span>
              )}
              {slot.meetingUrl && (
                <a
                  href={slot.meetingUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                >
                  <LinkIcon className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    {t("companySection.linkLabel")}
                  </span>
                </a>
              )}
              {isConfirmedSlot && (
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400">
                  {t("companySection.confirmedLabel")}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
