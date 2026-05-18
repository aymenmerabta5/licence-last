"use client"

import {
  Briefcase,
  CheckCircle2,
  FileText,
  Loader2,
  Users,
} from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { DashboardMasthead } from "@/app/[locale]/(authenticated)/_components/DashboardMasthead"
import { StatsBulletin } from "@/app/[locale]/(authenticated)/_components/StatsBulletin"
import { RecentOffers } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard/components/RecentOffers"
import { RecruiterQuickActions } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard/components/RecruiterQuickActions"
import { TrustGauge } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard/components/TrustGauge"
import {
  type CompanyTrustIndex,
  type OfferWithSkills,
  useRecruiterDashboardData,
} from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard/hooks/useRecruiterDashboardData"
import { Badge } from "@/components/ui/badge"
import { ease } from "@/lib/animations"

interface RecruiterDashboardProps {
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
  assistantEnabled: boolean
  initialOffers?: OfferWithSkills[]
  initialTrustData?: CompanyTrustIndex | null
}

export function RecruiterDashboard({
  user: _user,
  assistantEnabled,
  initialOffers,
  initialTrustData,
}: RecruiterDashboardProps) {
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
  } = useRecruiterDashboardData({
    offers: initialOffers,
    trustData: initialTrustData,
  })

  const t = useTranslations("dashboard.recruiter")
  const tHero = useTranslations("dashboard.recruiter.hero")

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

  const bulletinMetrics = [
    {
      label: t("stats.activeOffers"),
      value: String(activeOffers),
      sub: `${draftOffers} draft${draftOffers !== 1 ? "s" : ""}`,
      icon: Briefcase,
      highlight: activeOffers > 0,
    },
    {
      label: "Candidates",
      value: totalCandidates.toLocaleString(),
      sub: `${activeCandidates} on active offers`,
      icon: Users,
    },
    {
      label: "Total Offers",
      value: String(activeOffers + draftOffers + closedOffers),
      sub: `${closedOffers} completed`,
      icon: FileText,
    },
    {
      label: t("stats.hired"),
      value: String(closedOffers),
      sub: "Placements closed",
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="space-y-8 sm:space-y-12">
      <DashboardMasthead
        badge={<Badge variant="editorial-muted">{tHero("badge")}</Badge>}
        eyebrow={tHero("talentAcquisition")}
        title={activeOffers > 0 ? tHero("pipelineActive") : tHero("findNextIntern")}
        description={
          activeOffers > 0
            ? `${activeOffers} live offer${activeOffers !== 1 ? "s" : ""} attracting candidates. Track applications, manage your pipeline, and close positions.`
            : "Post internship offers, review candidates, and manage your recruitment pipeline from one place."
        }
        rightSlot={
          trustData ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  {tHero("trustScore")}
                </span>
                <span className="font-serif text-lg text-heading tabular-nums">
                  {trustData.trustScore}
                  <span className="text-xs text-primary">/100</span>
                </span>
              </div>
              <div className="h-1 w-32 bg-border/30 overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(trustData.trustScore, 100)}%` }}
                  transition={{ duration: 1.2, delay: 0.5, ease }}
                />
              </div>
            </div>
          ) : null
        }
      />

      <StatsBulletin metrics={bulletinMetrics} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 relative">
        <div className="lg:col-span-8 space-y-10">
          <RecentOffers offers={recentOffers} />
        </div>

        <div className="lg:col-span-4 space-y-10">
          <TrustGauge trustData={trustData} isLoading={isTrustLoading} />
          <RecruiterQuickActions assistantEnabled={assistantEnabled} />
        </div>
      </div>
    </div>
  )
}
