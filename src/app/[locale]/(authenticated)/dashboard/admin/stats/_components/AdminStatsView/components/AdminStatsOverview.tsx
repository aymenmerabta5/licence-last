"use client"

import {
  BarChart3,
  Briefcase,
  Building2,
  GraduationCap,
  Loader2,
  PieChart,
} from "lucide-react"

import { StatsCard } from "@/app/[locale]/(authenticated)/_components/StatsCard"
import { ApplicationsBreakdownCard } from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/components/ApplicationsBreakdownCard"

interface AdminStatsData {
  totalStudents: number
  unplacedStudents: number
  placedStudents: number
  placementRate: number
  totalCompaniesApproved: number
  totalOffersPublished: number
  totalApplications: number
  applicationsByStatus: Record<string, number>
}

interface AdminStatsOverviewProps {
  stats: AdminStatsData | null
  isLoading: boolean
}

function formatPercent(n: number) {
  return `${Math.max(0, Math.min(100, n))}%`
}

function buildCards(stats: AdminStatsData) {
  return [
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
      trend: stats.placementRate > 50 ? "Above 50%" : undefined,
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
}

export function AdminStatsOverview({
  stats,
  isLoading,
}: AdminStatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-16">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          Loading analytics...
        </span>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const cards = buildCards(stats)

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {cards.map((card, index) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
            trend={card.trend}
            index={index}
            compact
            className={
              index === cards.length - 1 && cards.length % 2 !== 0
                ? "col-span-2 lg:col-span-1"
                : undefined
            }
          />
        ))}
      </div>

      <ApplicationsBreakdownCard
        applicationsByStatus={stats.applicationsByStatus}
      />
    </div>
  )
}
