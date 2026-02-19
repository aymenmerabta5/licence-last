"use client"

import { Send } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ApplicationFormCard } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/ApplicationFormCard"
import { ApplicationSectionDivider } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/ApplicationSectionDivider"
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
      className="space-y-5"
    >
      <ApplicationSectionDivider />
      <ApplicationSuccessMessage successMsg={successMsg} />

      {application ? (
        <ApplicationStatusCard application={application} />
      ) : isOfferClosed ? (
        <div className="border border-border bg-muted/30 p-5">
          <p className="text-sm text-muted-foreground">{t("offerClosed")}</p>
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
    </motion.section>
  )
}
