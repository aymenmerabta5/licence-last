"use client"

import {
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  LinkIcon,
  Loader2,
  MapPin,
  MessageSquare,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { formatSchedule } from "@/lib/date"
import { cn } from "@/lib/utils"

interface InterviewSlotsSectionProps {
  interviews: Array<{
    id: string
    status: string
    note: string | null
    confirmedSlotId: string | null
    slots: Array<{
      id: string
      startsAt: Date | string
      endsAt: Date | string
      location: string | null
      meetingUrl: string | null
    }>
  }>
  confirmingSlotId: string | null
  onConfirmSlot: (interviewId: string, slotId: string) => void
}

export function InterviewSlotsSection({
  interviews,
  confirmingSlotId,
  onConfirmSlot,
}: InterviewSlotsSectionProps) {
  const t = useTranslations("dashboard.applications.hub")

  if (interviews.length === 0) return null

  return (
    <div className="space-y-4 border-t border-border/60 pt-4">
      <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
        {t("interview.title")}
      </h4>

      {interviews.map((interview) => {
        const isPending = interview.status === "pending_confirmation"

        return (
          <div
            key={interview.id}
            className={cn(
              "border p-4 transition-colors",
              isPending
                ? "border-amber-500/30 bg-amber-500/[0.02] dark:border-amber-500/20 dark:bg-amber-500/[0.04]"
                : "border-border/60 bg-card/30 dark:bg-card/50",
            )}
          >
            {isPending && (
              <div className="-mx-4 -mt-4 mb-4 h-0.5 bg-amber-500 dark:bg-amber-400" />
            )}

            {interview.note && (
              <div className="mb-3 flex items-start gap-2 bg-muted/30 p-3 text-xs text-muted-foreground dark:bg-muted/20">
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p className="font-light leading-relaxed">{interview.note}</p>
              </div>
            )}

            <div className="space-y-2">
              {interview.slots.map((slot) => {
                const isConfirmed = interview.confirmedSlotId === slot.id
                const isConfirming = confirmingSlotId === slot.id

                return (
                  <div
                    key={slot.id}
                    className={cn(
                      "flex items-center justify-between gap-3 px-3 py-2.5 transition-colors",
                      isConfirmed
                        ? "border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10"
                        : isPending
                          ? "border border-border/60 hover:border-primary/40 hover:bg-primary/[0.02]"
                          : "border border-border/40",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <CalendarDays
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isConfirmed
                            ? "text-emerald-500 dark:text-emerald-400"
                            : "text-muted-foreground",
                        )}
                      />
                      <div className="min-w-0">
                        <span
                          className={cn(
                            "block truncate text-xs",
                            isConfirmed
                              ? "font-medium text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {formatSchedule(slot.startsAt, slot.endsAt)}
                        </span>
                        <div className="mt-0.5 flex items-center gap-3">
                          {slot.location && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70">
                              <MapPin className="h-2.5 w-2.5" />
                              {slot.location}
                            </span>
                          )}
                          {slot.meetingUrl && (
                            <a
                              href={slot.meetingUrl}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                            >
                              <LinkIcon className="h-2.5 w-2.5" />
                              {t("interview.joinMeeting")}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isConfirmed && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {t("interview.confirmed")}
                        </span>
                      )}

                      {isPending && !isConfirmed && (
                        <Button
                          type="button"
                          variant="editorial-outline"
                          size="editorial-sm"
                          disabled={isConfirming}
                          className="gap-1.5"
                          onClick={() => onConfirmSlot(interview.id, slot.id)}
                        >
                          {isConfirming ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CalendarCheck2 className="h-3 w-3" />
                          )}
                          {isConfirming
                            ? t("interview.confirming")
                            : t("interview.confirm")}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
