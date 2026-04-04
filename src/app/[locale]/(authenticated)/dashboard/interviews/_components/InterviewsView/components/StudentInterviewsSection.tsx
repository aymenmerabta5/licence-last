"use client"

import {
  Building2,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  LinkIcon,
  Loader2,
  MapPin,
  MessageSquare,
  Search,
} from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { InterviewStatusBadge } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewStatusBadge"
import type {
  ConfirmSlotInput,
  StudentInterviewView,
} from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ease, reveal, revealWithDelay } from "@/lib/animations"
import { formatSchedule } from "@/lib/date"
import { cn } from "@/lib/utils"

interface StudentInterviewsSectionProps {
  interviews: StudentInterviewView[]
  isLoading: boolean
  errorMessage: string | null
  confirmingSlotId: string | null
  onConfirmSlot: (input: ConfirmSlotInput) => Promise<void>
}

export function StudentInterviewsSection({
  interviews,
  isLoading,
  errorMessage,
  confirmingSlotId,
  onConfirmSlot,
}: StudentInterviewsSectionProps) {
  const t = useTranslations("dashboard.interviews")

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          {t("studentSection.loading")}
        </span>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="space-y-2 border border-destructive/30 bg-destructive/5 p-6"
      >
        <p className="text-sm font-medium text-destructive">
          {t("studentSection.loadErrorTitle")}
        </p>
        <p className="text-xs text-muted-foreground">{errorMessage}</p>
      </motion.div>
    )
  }

  if (interviews.length === 0) {
    return (
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="space-y-4 border border-dashed border-border/60 p-12 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border/50 bg-muted/30">
          <Search className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <div className="space-y-2">
          <p className="font-serif text-xl text-heading">
            {t("studentSection.emptyTitle")}
          </p>
          <p className="mx-auto max-w-sm text-sm font-light text-muted-foreground">
            {t("studentSection.emptyDescription")}
          </p>
        </div>
      </motion.div>
    )
  }

  const pendingInterviews = interviews.filter(
    (interview) => interview.status === "pending_confirmation",
  )
  const otherInterviews = interviews.filter(
    (interview) => interview.status !== "pending_confirmation",
  )

  return (
    <section className="space-y-8">
      {pendingInterviews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500 dark:bg-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
              {t("studentSection.actionRequired")}
            </h2>
            <span className="text-xs text-muted-foreground">
              ({pendingInterviews.length})
            </span>
          </div>

          {pendingInterviews.map((interview, index) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              index={index}
              confirmingSlotId={confirmingSlotId}
              onConfirmSlot={onConfirmSlot}
            />
          ))}
        </div>
      )}

      {otherInterviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
            {pendingInterviews.length > 0
              ? t("studentSection.pastAndConfirmed")
              : t("studentSection.yourInterviews")}
          </h2>

          {otherInterviews.map((interview, index) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              index={index}
              confirmingSlotId={confirmingSlotId}
              onConfirmSlot={onConfirmSlot}
            />
          ))}
        </div>
      )}
    </section>
  )
}

interface InterviewCardProps {
  interview: StudentInterviewView
  index: number
  confirmingSlotId: string | null
  onConfirmSlot: (input: ConfirmSlotInput) => Promise<void>
}

function InterviewCard({
  interview,
  index,
  confirmingSlotId,
  onConfirmSlot,
}: InterviewCardProps) {
  const t = useTranslations("dashboard.interviews")
  const isPending = interview.status === "pending_confirmation"

  return (
    <motion.article
      {...reveal}
      transition={revealWithDelay(index * 0.06)}
      className={cn(
        "overflow-hidden border transition-colors",
        isPending
          ? "border-amber-500/30 bg-amber-500/[0.02] dark:border-amber-500/20 dark:bg-amber-500/[0.04]"
          : "border-border/60 bg-card/30 dark:bg-card/50",
      )}
    >
      {isPending && <div className="h-0.5 bg-amber-500 dark:bg-amber-400" />}

      <div className="flex items-start justify-between gap-4 p-5 pb-0">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar size="lg">
            {interview.companyLogoUrl && (
              <AvatarImage
                src={interview.companyLogoUrl}
                alt={interview.companyName}
              />
            )}
            <AvatarFallback>
              <Building2 className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate font-serif text-base text-heading">
              {interview.offerTitle}
            </h3>
            <p className="truncate text-xs font-light text-muted-foreground">
              {interview.companyName}
            </p>
          </div>
        </div>
        <InterviewStatusBadge status={interview.status} />
      </div>

      {interview.note && (
        <div className="px-5 pt-3">
          <div className="flex items-start gap-2 bg-muted/30 p-3 text-xs text-muted-foreground dark:bg-muted/20">
            <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p className="font-light leading-relaxed">{interview.note}</p>
          </div>
        </div>
      )}

      <div className="space-y-2 p-5">
        {isPending && (
          <p className="mb-3 text-[11px] font-medium text-muted-foreground">
            {t("studentSection.chooseSlot")}
          </p>
        )}

        {interview.slots.map((slot) => {
          const isConfirmedSlot = interview.confirmedSlotId === slot.id
          const isConfirming = confirmingSlotId === slot.id

          return (
            <div
              key={slot.id}
              className={cn(
                "flex items-center justify-between gap-3 px-3 py-2.5 transition-colors",
                isConfirmedSlot
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
                    isConfirmedSlot
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-muted-foreground",
                  )}
                />
                <div className="min-w-0">
                  <span
                    className={cn(
                      "block truncate text-xs",
                      isConfirmedSlot
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
                        {t("studentSection.joinMeeting")}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                {isConfirmedSlot && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("studentSection.confirmedLabel")}
                  </span>
                )}

                {isPending && !isConfirmedSlot && (
                  <Button
                    type="button"
                    variant="editorial-outline"
                    size="editorial-sm"
                    disabled={isConfirming}
                    className="gap-1.5"
                    onClick={() =>
                      void onConfirmSlot({
                        interviewId: interview.id,
                        slotId: slot.id,
                      })
                    }
                  >
                    {isConfirming ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CalendarCheck2 className="h-3 w-3" />
                    )}
                    {isConfirming
                      ? t("studentSection.confirming")
                      : t("studentSection.confirm")}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </motion.article>
  )
}
