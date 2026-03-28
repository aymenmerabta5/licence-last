"use client"

import {
  CalendarDays,
  LinkIcon,
  Loader2,
  MapPin,
  MessageSquare,
  UserRound,
} from "lucide-react"
import * as motion from "motion/react-client"
import { InterviewStatusBadge } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewStatusBadge"
import type { CompanyInterviewView } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ease, reveal, revealWithDelay } from "@/lib/animations"
import { formatSchedule } from "@/lib/date"
import { cn } from "@/lib/utils"

interface CompanyInterviewsSectionProps {
  interviews: CompanyInterviewView[]
  isLoading: boolean
  errorMessage: string | null
}

export function CompanyInterviewsSection({
  interviews,
  isLoading,
  errorMessage,
}: CompanyInterviewsSectionProps) {
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
        className="border border-dashed border-border/60 p-10 text-center space-y-3"
      >
        <CalendarDays className="h-8 w-8 text-muted-foreground/40 mx-auto" />
        <div className="space-y-1">
          <p className="font-serif text-lg text-heading">
            No interviews proposed
          </p>
          <p className="text-sm font-light text-muted-foreground">
            Use the form to create your first interview proposal.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
          Proposed Interviews
        </h2>
        <span className="text-xs text-muted-foreground">
          {interviews.length} total
        </span>
      </div>

      {interviews.map((interview, index) => (
        <motion.article
          key={interview.id}
          {...reveal}
          transition={revealWithDelay(index * 0.06)}
          className="border border-border/60 bg-card/30 dark:bg-card/50 overflow-hidden"
        >
          {/* Card header */}
          <div className="flex items-start justify-between gap-4 p-5 pb-0">
            <div className="flex items-start gap-3 min-w-0">
              <Avatar size="lg">
                {interview.studentImage && (
                  <AvatarImage
                    src={interview.studentImage}
                    alt={interview.studentName ?? "Student"}
                  />
                )}
                <AvatarFallback>
                  <UserRound className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="font-serif text-base text-heading truncate">
                  {interview.studentName ?? "Unnamed student"}
                </h3>
                <p className="text-xs font-light text-muted-foreground truncate">
                  {interview.offerTitle}
                </p>
              </div>
            </div>
            <InterviewStatusBadge status={interview.status} />
          </div>

          {/* Note */}
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
            {interview.slots.map((slot) => {
              const isConfirmedSlot = interview.confirmedSlotId === slot.id
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
                  <div className="flex items-center gap-2 min-w-0">
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
                        "text-xs truncate",
                        isConfirmedSlot
                          ? "font-medium text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {formatSchedule(slot.startsAt, slot.endsAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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
                        <span className="hidden sm:inline">Link</span>
                      </a>
                    )}
                    {isConfirmedSlot && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400">
                        Confirmed
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.article>
      ))}
    </section>
  )
}
