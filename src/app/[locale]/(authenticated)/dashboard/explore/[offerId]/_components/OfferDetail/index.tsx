"use client"

import * as motion from "motion/react-client"

import { reveal, ease } from "@/lib/animations"

import { useOfferMatching } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/hooks/useOfferMatching"
import { useOfferApplication } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/hooks/useOfferApplication"
import { OfferHeader } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/OfferHeader"
import { OfferBody } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/OfferBody"
import { DetailsSidebar } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/DetailsSidebar"
import { ApplicationPanel } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/ApplicationPanel"
import { MatchingPanel } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/MatchingPanel"
import { CompanyCard } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/CompanyCard"
import type { OfferDetailProps } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/types"

export type { OfferDetailProps }

export function OfferDetailClient({
  offer,
  existingApplication,
  studentUserId,
}: OfferDetailProps) {
  const matching = useOfferMatching(studentUserId, offer.id, offer.companyId)
  const app = useOfferApplication(offer, existingApplication)

  return (
    <div className="space-y-10 pb-20">
      {/* Editorial Masthead */}
      <OfferHeader offer={offer} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Main column */}
        <div className="lg:col-span-8 space-y-10">
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

        {/* Sidebar column */}
        <motion.aside
          {...reveal}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
          className="lg:col-span-4 space-y-6"
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
          />
        </motion.aside>
      </div>
    </div>
  )
}
