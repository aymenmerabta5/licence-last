"use client"

import {
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  LinkIcon,
  Loader2,
  MapPin,
} from "lucide-react"
import { useTranslations } from "next-intl"
import type {
  ConfirmSlotInput,
  InterviewDetailViewProps,
} from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/types"
import { Button } from "@/components/ui/button"
import { formatSchedule } from "@/lib/date"
import { cn } from "@/lib/utils"

interface SlotSelectorProps {
  interview: InterviewDetailViewProps["interview"]
  confirmingSlotId: string | null
  onConfirmSlot: (input: ConfirmSlotInput) => Promise<void>
}

export function SlotSelector({ interview, confirmingSlotId, onConfirmSlot }: SlotSelectorProps) {
  const t = useTranslations("dashboard.interviews.detail")
  const isPending = interview.status === "pending_confirmation"

  if (interview.slots.length === 0) {
    return (
      <div className="border border-dashed border-border/60 p-8 text-center">
        <p className="text-sm text-muted-foreground">{t("noSlotsAvailable")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
        {t("chooseSlotTitle")}
      </h2>
      {interview.slots.map((slot) => {
        const isConfirmed = interview.confirmedSlotId === slot.id
        const isConfirming = confirmingSlotId === slot.id
        const isExpired = new Date(slot.endsAt) <= new Date()
        const canConfirm = isPending && !isConfirmed && !isExpired

        return (
          <div
            key={slot.id}
            className={cn(
              "flex items-center justify-between gap-3 border px-4 py-3 transition-colors",
              isConfirmed
                ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10"
                : isExpired
                  ? "border-border/30 bg-muted/20 opacity-60"
                  : canConfirm
                    ? "border-border/60 hover:border-primary/40 hover:bg-primary/[0.02]"
                    : "border-border/40",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <CalendarDays
                className={cn(
                  "h-4 w-4 shrink-0",
                  isConfirmed
                    ? "text-emerald-500 dark:text-emerald-400"
                    : "text-muted-foreground",
                )}
              />
              <div className="min-w-0">
                <span
                  className={cn(
                    "block truncate text-sm",
                    isConfirmed ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {formatSchedule(slot.startsAt, slot.endsAt)}
                </span>
                <div className="mt-0.5 flex flex-wrap items-center gap-3">
                  {slot.location && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70">
                      <MapPin className="h-3 w-3" />
                      {slot.location}
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
                      {t("linkLabel")}
                    </a>
                  )}
                  {isExpired && (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-destructive">
                      {t("slotExpired")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              {isConfirmed && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t("confirmedLabel")}
                </span>
              )}
              {isPending && !isConfirmed && !isExpired && (
                <Button
                  type="button"
                  variant="editorial-outline"
                  size="editorial-sm"
                  disabled={isConfirming}
                  className="gap-1.5"
                  onClick={() => void onConfirmSlot({ interviewId: interview.id, slotId: slot.id })}
                >
                  {isConfirming ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CalendarCheck2 className="h-3 w-3" />
                  )}
                  {isConfirming ? "..." : t("confirmButton")}
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
