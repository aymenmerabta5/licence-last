"use client"

import { AdminStatsHeader } from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/components/AdminStatsHeader"
import { AdminStatsOverview } from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/components/AdminStatsOverview"
import { CompanyTrustCard } from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/components/CompanyTrustCard"
import { OpenReportsCard } from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/components/OpenReportsCard"
import { useAdminStats } from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/hooks/useAdminStats"
import { useResolveReport } from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/hooks/useResolveReport"

export function AdminStatsView() {
  const {
    stats,
    isLoading,
    trustIndices,
    isTrustLoading,
    reports,
    isReportsLoading,
  } = useAdminStats()
  const { resolveReport, isPending: isResolvingReport } = useResolveReport()

  return (
    <div className="space-y-10 pb-16">
      <AdminStatsHeader />
      <AdminStatsOverview stats={stats ?? null} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="border border-border/60 bg-card/30 dark:bg-card/50 p-6">
            <CompanyTrustCard
              trustIndices={trustIndices}
              isLoading={isTrustLoading}
            />
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="border border-border/60 bg-card/30 dark:bg-card/50 p-6">
            <OpenReportsCard
              reports={reports}
              isLoading={isReportsLoading}
              onResolve={resolveReport}
              isResolving={isResolvingReport}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
