"use client"

import {
  BarChart3,
  Building2,
  GraduationCap,
  Briefcase,
  PieChart,
} from "lucide-react"

import { StatsCard } from "@/app/[locale]/(authenticated)/_components/StatsCard"

import { useAdminStats } from "./hooks/useAdminStats"
import { ApplicationsBreakdownCard } from "./components/ApplicationsBreakdownCard"
import { CompanyTrustCard } from "./components/CompanyTrustCard"
import { OpenReportsCard } from "./components/OpenReportsCard"

function formatPercent(n: number) {
  return `${Math.max(0, Math.min(100, n))}%`
}

export function AdminStatsView() {
  const { stats, isLoading, trustIndices, isTrustLoading, reports, isReportsLoading } =
    useAdminStats()

  const cards = stats
    ? [
        {
          title: "Total Students",
          value: String(stats.totalStudents),
          description: `${stats.unplacedStudents} unplaced`,
          icon: GraduationCap,
        },
        {
          title: "Placed Students",
          value: String(stats.placedStudents),
          description: `Placement rate ${formatPercent(stats.placementRate)}`,
          icon: PieChart,
        },
        {
          title: "Approved Companies",
          value: String(stats.totalCompaniesApproved),
          description: "Active partners",
          icon: Building2,
        },
        {
          title: "Published Offers",
          value: String(stats.totalOffersPublished),
          description: "Visible to students",
          icon: Briefcase,
        },
        {
          title: "Applications",
          value: String(stats.totalApplications),
          description: "All statuses",
          icon: BarChart3,
        },
      ]
    : []

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
          Admin Analytics
        </p>
        <h1 className="font-serif text-[clamp(2.25rem,4vw,3rem)] leading-none tracking-tight text-heading">
          Platform Statistics
        </h1>
        <p className="text-sm text-muted-foreground font-light max-w-2xl">
          Snapshot of placements, activity, and overall health.
        </p>
      </div>

      {isLoading && (
        <div className="text-sm text-muted-foreground">Loading&hellip;</div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((c, idx) => (
              <StatsCard
                key={c.title}
                title={c.title}
                value={c.value}
                description={c.description}
                icon={c.icon}
                index={idx}
              />
            ))}
          </div>

          <ApplicationsBreakdownCard
            applicationsByStatus={stats.applicationsByStatus}
          />
        </>
      )}

      <CompanyTrustCard
        trustIndices={trustIndices}
        isLoading={isTrustLoading}
      />

      <OpenReportsCard reports={reports} isLoading={isReportsLoading} />
    </div>
  )
}
