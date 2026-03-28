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
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          Loading interviews
        </span>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="border border-destructive/30 bg-destructive/5 p-6 space-y-2"
      >
        <p className="text-sm font-medium text-destructive">
          Could not load interviews
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
        className="border border-dashed border-border/60 p-12 text-center space-y-4"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border/50 bg-muted/30">
          <Search className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <div className="space-y-2">
          <p className="font-serif text-xl text-heading">
            No interviews yet
          </p>
          <p className="text-sm font-light text-muted-foreground max-w-sm mx-auto">
            Interview invitations from companies will appear here. Keep your
            applications active and check back soon.
          </p>
        </div>
      </motion.div>
    )
  }

  const pendingInterviews = interviews.filter(
    (i) => i.status === "pending_confirmation",
  )
  const otherInterviews = interviews.filter(
    (i) => i.status !== "pending_confirmation",
  )

  return (
    <section className="space-y-8">
      {/* Pending interviews — action required */}
      {pendingInterviews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
              Action Required
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

      {/* Confirmed / cancelled */}
      {otherInterviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
            {pendingInterviews.length > 0 ? "Past & Confirmed" : "Your Interviews"}
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
  const isPending = interview.status === "pending_confirmation"

  return (
    <motion.article
      {...reveal}
      transition={revealWithDelay(index * 0.06)}
      className={cn(
        "border overflow-hidden transition-colors",
        isPending
          ? "border-amber-500/30 dark:border-amber-500/20 bg-amber-500/[0.02] dark:bg-amber-500/[0.04]"
          : "border-border/60 bg-card/30 dark:bg-card/50",
      )}
    >
      {/* Accent line for pending */}
      {isPending && <div className="h-0.5 bg-amber-500 dark:bg-amber-400" />}

      {/* Card header */}
      <div className="flex items-start justify-between gap-4 p-5 pb-0">
        <div className="flex items-start gap-3 min-w-0">
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
            <h3 className="font-serif text-base text-heading truncate">
              {interview.offerTitle}
            </h3>
            <p className="text-xs font-light text-muted-foreground truncate">
              {interview.companyName}
            </p>
          </div>
        </div>
        <InterviewStatusBadge status={interview.status} />
      </div>

      {/* Note from company */}
      {interview.note && (
        <div className="px-5 pt-3">
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 dark:bg-muted/20 p-3">
            <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <p className="font-light leading-relaxed">{interview.note}</p>
          </div>
        </div>
      )}

      {/* Slots */}
      <div className="p-5 space-y-2">
        {isPending && (
          <p className="text-[11px] font-medium text-muted-foreground mb-3">
            Choose a time slot that works for you:
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
              <div className="flex items-center gap-2 min-w-0">
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
                      "text-xs block truncate",
                      isConfirmedSlot
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatSchedule(slot.startsAt, slot.endsAt)}
                  </span>
                  <div className="flex items-center gap-3 mt-0.5">
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
                        Join meeting
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                {isConfirmedSlot && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Confirmed
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
                    {isConfirming ? "Confirming..." : "Confirm"}
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
