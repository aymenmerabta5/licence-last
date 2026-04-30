"use client"

import { Loader2, MessageSquare } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { BackLink } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/components/BackLink"
import { InterviewHeader } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/components/InterviewHeader"
import { RequestChangeForm } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/components/RequestChangeForm"
import { SlotSelector } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/components/SlotSelector"
import { useInterviewDetailData } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/hooks/useInterviewDetailData"
import type { InterviewDetailViewProps } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/types"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

export function InterviewDetailView({ interview: initialInterview }: InterviewDetailViewProps) {
  const t = useTranslations("dashboard.interviews.detail")
  const data = useInterviewDetailData({ interviewId: initialInterview.id })
  const interview = data.interview ?? initialInterview

  if (data.isLoading && !data.interview) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          {t("loading")}
        </span>
      </div>
    )
  }

  if (data.errorMessage) {
    return (
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="space-y-2 border border-destructive/30 bg-destructive/5 p-6"
      >
        <p className="text-sm font-medium text-destructive">{t("loadErrorTitle")}</p>
        <p className="text-xs text-muted-foreground">{data.errorMessage}</p>
      </motion.div>
    )
  }

  const isPending = interview.status === "pending_confirmation"

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <motion.div {...reveal} transition={revealWithDelay(0)}>
        <BackLink />
      </motion.div>

      <motion.div {...reveal} transition={revealWithDelay(0.05)}>
        <InterviewHeader interview={interview} />
      </motion.div>

      {interview.note && (
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="flex items-start gap-3 border border-border/40 bg-muted/20 p-4 dark:bg-muted/10"
        >
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              {t("noteTitle")}
            </p>
            <p className="text-sm font-light leading-relaxed text-muted-foreground">
              {interview.note}
            </p>
          </div>
        </motion.div>
      )}

      <motion.div {...reveal} transition={revealWithDelay(0.15)}>
        <SlotSelector
          interview={interview}
          confirmingSlotId={data.confirmingSlotId}
          onConfirmSlot={data.confirmSlot}
        />
      </motion.div>

      {isPending && (
        <motion.div {...reveal} transition={revealWithDelay(0.2)}>
          <RequestChangeForm offerId={interview.offerId} companyName={interview.companyName} />
        </motion.div>
      )}
    </div>
  )
}
