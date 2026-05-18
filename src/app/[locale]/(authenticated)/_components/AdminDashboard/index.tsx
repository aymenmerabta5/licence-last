"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { DashboardMasthead } from "@/app/[locale]/(authenticated)/_components/DashboardMasthead"
import { StatsBulletin } from "@/app/[locale]/(authenticated)/_components/StatsBulletin"
import { StatusBreakdown } from "@/app/[locale]/(authenticated)/_components/AdminDashboard/components/StatusBreakdown"
import { TrustLeaderboard } from "@/app/[locale]/(authenticated)/_components/AdminDashboard/components/TrustLeaderboard"
import { UniversityKpiGrid } from "@/app/[locale]/(authenticated)/_components/AdminDashboard/components/UniversityKpiGrid"
import { useAdminBulletinMetrics } from "@/app/[locale]/(authenticated)/_components/AdminDashboard/hooks/useAdminBulletinMetrics"
import {
  type AdminStats,
  type TrustIndex,
  type UniversityDashboardStats,
  useAdminDashboardData,
} from "@/app/[locale]/(authenticated)/_components/AdminDashboard/hooks/useAdminDashboardData"
import { Badge } from "@/components/ui/badge"

interface AdminDashboardProps {
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
  initialStats?: AdminStats
  initialUniversityStats?: UniversityDashboardStats
  initialTrustIndices?: TrustIndex[]
}

export function AdminDashboard({
  user,
  initialStats,
  initialUniversityStats,
  initialTrustIndices,
}: AdminDashboardProps) {
  const t = useTranslations("dashboard.admin")
  const { isSuperAdmin, stats, universityStats, isLoading, trustIndices } =
    useAdminDashboardData(user.role, {
      stats: initialStats,
      universityStats: initialUniversityStats,
      trustIndices: initialTrustIndices,
    })

  const bulletinMetrics = useAdminBulletinMetrics(stats, isSuperAdmin)

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
    <div className="space-y-8 sm:space-y-12">
      <DashboardMasthead
        badge={<Badge variant="editorial-muted">{isSuperAdmin ? t("badge.system") : t("badge.university")}</Badge>}
        eyebrow={isSuperAdmin ? t("eyebrow.global") : t("eyebrow.institutional")}
        title={isSuperAdmin ? t("title.super") : t("title.university")}
        description={
          isSuperAdmin ? t("description.super") : t("description.university")
        }
      />

      {/* Platform stats bar — super_admin only */}
      {isSuperAdmin && stats && (
        <StatsBulletin metrics={bulletinMetrics} />
      )}

      {/* University metrics grid — university_admin only */}
      {!isSuperAdmin && universityStats && (
        <UniversityKpiGrid stats={universityStats} />
      )}

      {isSuperAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <div className="border-2 border-foreground bg-background shadow-[6px_6px_0_0_oklch(var(--border)_/_0.3)] p-6 md:p-10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(oklch(var(--border)_/_0.2)_1px,transparent_1px),linear-gradient(90deg,oklch(var(--border)_/_0.2)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50" />
              {stats && (
                <StatusBreakdown
                  applicationsByStatus={stats.applicationsByStatus}
                  totalApplications={stats.totalApplications}
                />
              )}
            </div>
          </div>
          <div className="lg:col-span-4 max-lg:order-last">
            <TrustLeaderboard indices={trustIndices} />
          </div>
        </div>
      )}
    </div>
  )
}
