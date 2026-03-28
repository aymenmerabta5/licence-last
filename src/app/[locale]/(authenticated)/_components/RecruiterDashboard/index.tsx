"use client"

import { Loader2 } from "lucide-react"

import { OffersPulse } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard/components/OffersPulse"
import { RecentOffers } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard/components/RecentOffers"
import { RecruiterHero } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard/components/RecruiterHero"
import { RecruiterQuickActions } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard/components/RecruiterQuickActions"
import { TrustGauge } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard/components/TrustGauge"
import { useRecruiterDashboardData } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard/hooks/useRecruiterDashboardData"

interface RecruiterDashboardProps {
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
}

export function RecruiterDashboard({ user: _user }: RecruiterDashboardProps) {
  const {
    activeOffers,
    draftOffers,
    closedOffers,
    totalCandidates,
    activeCandidates,
    recentOffers,
    trustData,
    isTrustLoading,
    isLoading,
  } = useRecruiterDashboardData()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[50vh] gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          Loading dashboard
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <RecruiterHero activeOffers={activeOffers} trustData={trustData} />

      <OffersPulse
        activeOffers={activeOffers}
        draftOffers={draftOffers}
        totalCandidates={totalCandidates}
        activeCandidates={activeCandidates}
        closedOffers={closedOffers}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 relative">
        <div className="lg:col-span-7 space-y-10">
          <RecentOffers offers={recentOffers} />
        </div>

        <div className="lg:col-span-5 space-y-10">
          <TrustGauge trustData={trustData} isLoading={isTrustLoading} />
          <RecruiterQuickActions />
        </div>
      </div>
    </div>
  )
}
