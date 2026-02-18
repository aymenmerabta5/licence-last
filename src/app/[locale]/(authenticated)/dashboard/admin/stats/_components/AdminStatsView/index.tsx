"use client"

import * as motion from "motion/react-client"
import {
  BarChart3,
  Building2,
  GraduationCap,
  Briefcase,
  PieChart,
  Loader2,
} from "lucide-react"

import { ease } from "@/lib/animations"
import { StatsCard } from "@/app/[locale]/(authenticated)/_components/StatsCard"

import { useAdminStats } from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/hooks/useAdminStats"
import { useResolveReport } from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/hooks/useResolveReport"
import { ApplicationsBreakdownCard } from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/components/ApplicationsBreakdownCard"
import { CompanyTrustCard } from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/components/CompanyTrustCard"
import { OpenReportsCard } from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/components/OpenReportsCard"

function formatPercent(n: number) {
  return `${Math.max(0, Math.min(100, n))}%`
}

export function AdminStatsView() {
  const { stats, isLoading, trustIndices, isTrustLoading, reports, isReportsLoading } =
    useAdminStats()
  const { resolveReport, isPending: isResolvingReport } = useResolveReport()

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
    : []

  return (
    <div className="space-y-10">
      {/* Editorial Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease }}
        className="relative"
      >
        <div className="h-0.5 bg-primary" />
        <div className="border border-t-0 border-border/50 p-8 md:p-10">
          <div className="absolute -top-20 end-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />

          <div className="flex items-center justify-between mb-6">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary [[dir=rtl]_&]:tracking-normal">
              Admin Analytics
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.08] tracking-tight text-heading max-w-xl">
            Platform Statistics
          </h1>
          <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-lg mt-3">
            Snapshot of placements, activity, and overall health across the
            Internex platform.
          </p>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground font-medium">
            Loading analytics...
          </span>
        </div>
      )}

      {/* Stats Grid */}
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
                trend={c.trend}
                index={idx}
              />
            ))}
          </div>

          <ApplicationsBreakdownCard
            applicationsByStatus={stats.applicationsByStatus}
          />
        </>
      )}

      {/* Two-column bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <CompanyTrustCard
            trustIndices={trustIndices}
            isLoading={isTrustLoading}
          />
        </div>
        <div className="lg:col-span-5">
          <OpenReportsCard
            reports={reports}
            isLoading={isReportsLoading}
            onResolve={resolveReport}
            isResolving={isResolvingReport}
          />
        </div>
      </div>
    </div>
  )
}
