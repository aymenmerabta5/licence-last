import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import type { CandidatesDashboardTranslations } from "@/app/[locale]/(authenticated)/dashboard/candidates/_components/CandidatesPipelinePage/types"

interface StatsOverviewProps {
  offersCount: number
  activeOffersCount: number
  totalCandidates: number
  t: CandidatesDashboardTranslations
}

export function StatsOverview({
  offersCount,
  activeOffersCount,
  totalCandidates,
  t,
}: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("candidates.stats.totalOffers")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-serif text-3xl text-heading">{offersCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("candidates.stats.activeOffers")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-serif text-3xl text-heading">{activeOffersCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("candidates.stats.totalCandidates")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-serif text-3xl text-primary">{totalCandidates}</div>
        </CardContent>
      </Card>
    </div>
  )
}
