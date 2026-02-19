import { CandidatesHeader } from "@/app/[locale]/(authenticated)/dashboard/candidates/_components/CandidatesPipelinePage/components/CandidatesHeader"
import { OffersFooterLink } from "@/app/[locale]/(authenticated)/dashboard/candidates/_components/CandidatesPipelinePage/components/OffersFooterLink"
import { OffersWithCandidatesSection } from "@/app/[locale]/(authenticated)/dashboard/candidates/_components/CandidatesPipelinePage/components/OffersWithCandidatesSection"
import { StatsOverview } from "@/app/[locale]/(authenticated)/dashboard/candidates/_components/CandidatesPipelinePage/components/StatsOverview"
import type {
  CandidatesDashboardOffer,
  CandidatesDashboardTranslations,
} from "@/app/[locale]/(authenticated)/dashboard/candidates/_components/CandidatesPipelinePage/types"

interface CandidatesPipelinePageProps {
  offers: CandidatesDashboardOffer[]
  t: CandidatesDashboardTranslations
}

export function CandidatesPipelinePage({
  offers,
  t,
}: CandidatesPipelinePageProps) {
  const offersWithCandidates = offers.filter(
    (offer) => offer.candidatesCount > 0,
  )
  const totalCandidates = offersWithCandidates.reduce(
    (sum, offer) => sum + offer.candidatesCount,
    0,
  )
  const activeOffersCount = offers.filter(
    (offer) => offer.status === "published",
  ).length

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <CandidatesHeader t={t} totalCandidates={totalCandidates} />

      <StatsOverview
        offersCount={offers.length}
        activeOffersCount={activeOffersCount}
        totalCandidates={totalCandidates}
        t={t}
      />

      <OffersWithCandidatesSection offers={offersWithCandidates} t={t} />

      <OffersFooterLink t={t} />
    </div>
  )
}
