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
      transition={{ duration: 0.6, ease, delay: 0.2 }}
      className="border border-border/50"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border/50 px-6 py-4">
        <h2 className="font-serif text-xl text-heading">{t("application")}</h2>
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground [[dir=rtl]_&]:tracking-normal">
          {application ? t("alreadyApplied") : t("actionRequired")}
        </span>
      </div>

      <div className="px-6 py-6">
        <ApplicationSuccessMessage successMsg={successMsg} />

        <div className="mx-auto">
          {application ? (
            <ApplicationStatusCard application={application} />
          ) : isOfferClosed ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center border border-dashed border-border/60">
                <Send className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">
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
              size="editorial"
              className="w-full gap-2"
            >
              <Send className="h-4 w-4" />
              {t("applyNow")}
            </Button>
          )}
        </div>
      </div>
    </motion.section>
  )
}
