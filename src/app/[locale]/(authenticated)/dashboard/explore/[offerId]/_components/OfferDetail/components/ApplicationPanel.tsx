"use client"

import { Send } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ApplicationFormCard } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/ApplicationFormCard"
import { ApplicationStatusCard } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/ApplicationStatusCard"
import { ApplicationSuccessMessage } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/ApplicationSuccessMessage"
import type {
  OfferApplicationSummary,
  OfferApplyMutation,
} from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/types"
import { Button } from "@/components/ui/button"
import { ease, reveal } from "@/lib/animations"

interface ApplicationPanelProps {
  application: OfferApplicationSummary | null
  isOfferClosed: boolean
  showApplyForm: boolean
  onShowApplyForm: () => void
  coverLetter: string
  onCoverLetterChange: (value: string) => void
  coverLetterDraft: string | null
  onApplyDraft: () => void
  successMsg: string
  isDrafting: boolean
  draftError: Error | null
  onDraftCoverLetter: () => void
  applyMutation: OfferApplyMutation
  offerId: string
}

export function ApplicationPanel({
  application,
  isOfferClosed,
  showApplyForm,
  onShowApplyForm,
  coverLetter,
  onCoverLetterChange,
  coverLetterDraft,
  onApplyDraft,
  successMsg,
  isDrafting,
  draftError,
  onDraftCoverLetter,
  applyMutation,
  offerId,
}: ApplicationPanelProps) {
  const t = useTranslations("dashboard.offerDetail")

  return (
    <motion.section
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.2 }}
      className="space-y-6 mt-16 p-8 border-[3px] border-border bg-card relative"
    >
      <div className="absolute top-0 start-0 w-3 h-3 border-t-[3px] border-s-[3px] border-primary -translate-x-[3px] rtl:translate-x-[3px] -translate-y-[3px]" />
      <div className="absolute top-0 end-0 w-3 h-3 border-t-[3px] border-e-[3px] border-primary translate-x-[3px] rtl:-translate-x-[3px] -translate-y-[3px]" />
      <div className="absolute bottom-0 start-0 w-3 h-3 border-b-[3px] border-s-[3px] border-primary -translate-x-[3px] rtl:translate-x-[3px] translate-y-[3px]" />
      <div className="absolute bottom-0 end-0 w-3 h-3 border-b-[3px] border-e-[3px] border-primary translate-x-[3px] rtl:-translate-x-[3px] translate-y-[3px]" />

      <div className="mb-6 flex justify-between items-end border-b-2 border-border/80 pb-2">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">
          {t("application")}
        </h2>
        <span className="text-[10px] font-mono text-muted-foreground">
          {"// "}
          {t("actionRequired").toUpperCase()}
        </span>
      </div>

      <ApplicationSuccessMessage successMsg={successMsg} />

      <div className="mx-auto">
        {application ? (
          <ApplicationStatusCard application={application} />
        ) : isOfferClosed ? (
          <div className="bg-muted p-8 text-center">
            <p className="text-xl font-serif text-muted-foreground">
              {t("offerClosed")}
            </p>
          </div>
        ) : showApplyForm ? (
          <ApplicationFormCard
            coverLetter={coverLetter}
            onCoverLetterChange={onCoverLetterChange}
            coverLetterDraft={coverLetterDraft}
            onApplyDraft={onApplyDraft}
            isDrafting={isDrafting}
            draftError={draftError}
            onDraftCoverLetter={onDraftCoverLetter}
            applyMutation={applyMutation}
            offerId={offerId}
          />
        ) : (
          <Button
            onClick={onShowApplyForm}
            variant="editorial"
            size="lg"
            className="w-full h-14 text-sm gap-3 uppercase tracking-widest font-bold shadow-none"
          >
            <Send className="h-4 w-4" />
            {t("applyNow")}
          </Button>
        )}
      </div>
    </motion.section>
  )
}
