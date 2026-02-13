"use client"

import * as motion from "motion/react-client"

import { reveal, ease } from "@/lib/animations"

import { useOfferMatching } from "./hooks/useOfferMatching"
import { useOfferApplication } from "./hooks/useOfferApplication"
import { OfferHeader } from "./components/OfferHeader"
import { OfferBody } from "./components/OfferBody"
import { DetailsSidebar } from "./components/DetailsSidebar"
import { ApplicationPanel } from "./components/ApplicationPanel"
import { MatchingPanel } from "./components/MatchingPanel"
import { CompanyCard } from "./components/CompanyCard"
import type { OfferDetailProps } from "./types"

export type { OfferDetailProps }

export function OfferDetailClient({
  offer,
  existingApplication,
  studentUserId,
}: OfferDetailProps) {
  const matching = useOfferMatching(studentUserId, offer.id, offer.companyId)
  const app = useOfferApplication(offer, existingApplication)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <OfferHeader offer={offer} />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">
          <OfferBody offer={offer} />
        </div>

        {/* Sidebar */}
        <motion.aside
          {...reveal}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
          className="lg:w-80 shrink-0 space-y-6"
        >
          <DetailsSidebar offer={offer} />

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
            aiStatus={app.aiStatus}
            aiError={app.aiError}
            onDraftCoverLetter={app.draftCoverLetter}
            applyMutation={app.applyMutation}
            offerId={offer.id}
          />

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
          />
        </motion.aside>
      </div>
    </div>
  )
}
