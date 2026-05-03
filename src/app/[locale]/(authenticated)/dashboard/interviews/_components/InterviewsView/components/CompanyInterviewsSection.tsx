"use client"

import { CalendarDays, Loader2, MessageSquare, UserRound } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { InterviewSlotList } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewSlotList"
import { InterviewStatusBadge } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewStatusBadge"
import type { CompanyInterviewView } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

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
  const t = useTranslations("dashboard.interviews")

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          {t("companySection.loading")}
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
          {t("companySection.loadErrorTitle")}
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
        className="space-y-3 border border-dashed border-border/60 p-10 text-center"
      >
        <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/40" />
        <div className="space-y-1">
          <p className="font-serif text-lg text-heading">
            {t("companySection.emptyTitle")}
          </p>
          <p className="text-sm font-light text-muted-foreground">
            {t("companySection.emptyDescription")}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
          {t("companySection.title")}
        </h2>
        <span className="text-xs text-muted-foreground">
          {t("companySection.total", { count: interviews.length })}
        </span>
      </div>

      {interviews.map((interview, index) => (
        <motion.article
          key={interview.id}
          {...reveal}
          transition={revealWithDelay(index * 0.06)}
          className="overflow-hidden border border-border/60 bg-card/30 dark:bg-card/50"
        >
          <div className="flex items-start justify-between gap-4 p-5 pb-0">
            <div className="flex min-w-0 items-start gap-3">
              <Avatar size="lg">
                {interview.studentImage && (
                  <AvatarImage
                    src={interview.studentImage}
                    alt={interview.studentName ?? t("fallbackStudent")}
                  />
                )}
                <AvatarFallback>
                  <UserRound className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="truncate font-serif text-base text-heading">
                  {interview.studentName ?? t("fallbackStudent")}
                </h3>
                <p className="truncate text-xs font-light text-muted-foreground">
                  {interview.offerTitle}
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

          <InterviewSlotList
            slots={interview.slots}
            confirmedSlotId={interview.confirmedSlotId}
          />
        </motion.article>
      ))}
    </section>
  )
}
