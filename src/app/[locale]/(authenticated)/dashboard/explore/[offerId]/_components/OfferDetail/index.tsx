"use client"

import * as motion from "motion/react-client"
import { ApplicationPanel } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/ApplicationPanel"
import { CompanyCard } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/CompanyCard"
import { DetailsSidebar } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/DetailsSidebar"
import { MatchingPanel } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/MatchingPanel"
import { OfferBody } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/OfferBody"
import { OfferHeader } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/OfferHeader"
import { useCompanyReport } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/hooks/useCompanyReport"
import { useOfferApplication } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/hooks/useOfferApplication"
import { useOfferMatching } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/hooks/useOfferMatching"
import { useOfferSave } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/hooks/useOfferSave"
import type { OfferDetailProps } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/types"
import { ease, reveal } from "@/lib/animations"

export type { OfferDetailProps }

export function OfferDetailClient({
  offer,
  existingApplication,
  studentUserId,
}: OfferDetailProps) {
  const matching = useOfferMatching(studentUserId, offer.id, offer.companyId)
  const app = useOfferApplication(offer, existingApplication)
  const save = useOfferSave(offer.id)
  const companyReport = useCompanyReport(offer.companyId)

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Editorial Masthead */}
      <OfferHeader
        offer={offer}
        isSaved={save.isSaved}
        isSaveBusy={save.isChecking || save.isMutating}
        saveUnavailable={save.unavailable}
        onToggleSaved={() => {
          void save.toggleSaved()
        }}
      />

      {/* Main Content Grid - Newspaper spread effect */}
      <div className="grid grid-cols-1 lg:grid-cols-12 relative border-t-2 border-border/80 pt-8 mt-8">
        {/* Main column */}
        <div className="lg:col-span-8 lg:pe-12 space-y-12">
          <OfferBody offer={offer} />

          <ApplicationPanel
            application={app.application}
            isOfferClosed={!!app.isOfferClosed}
            showApplyForm={app.showApplyForm}
            onShowApplyForm={() => app.setShowApplyForm(true)}
            coverLetter={app.coverLetter}
            onCoverLetterChange={app.setCoverLetter}
            coverLetterDraft={app.coverLetterDraft}
            onApplyDraft={() => app.setCoverLetter(app.coverLetterDraft!)}
            successMsg={app.successMsg}
            isDrafting={app.isDrafting}
            draftError={app.draftError}
            onDraftCoverLetter={app.draftCoverLetter}
            applyMutation={app.applyMutation}
            offerId={offer.id}
          />
        </div>

        {/* Vertical divider on desktop */}
        <div className="hidden lg:block absolute inset-inline-start-[66.666667%] top-8 bottom-0 w-px bg-border/40" />

        {/* Sidebar column */}
        <motion.aside
          {...reveal}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
          className="lg:col-span-4 lg:ps-12 space-y-8 mt-12 lg:mt-0"
        >
          <DetailsSidebar offer={offer} />

          <MatchingPanel
            matchScoreQuery={matching.matchScoreQuery}
            skillGapQuery={matching.skillGapQuery}
            latestReadiness={matching.latestReadiness}
            readinessDelta={matching.readinessDelta}
          />

          <CompanyCard
            offer={offer}
            trustScore={matching.trustIndexQuery.data?.trustScore}
            trustTier={matching.trustIndexQuery.data?.tier}
            report={companyReport}
          />
        </motion.aside>
      </div>
    </div>
  )
}
