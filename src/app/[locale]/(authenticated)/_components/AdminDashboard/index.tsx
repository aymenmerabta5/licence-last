"use client"

import { Loader2 } from "lucide-react"
import { DashboardHero } from "@/app/[locale]/(authenticated)/_components/AdminDashboard/components/DashboardHero"
import { PlatformBulletin } from "@/app/[locale]/(authenticated)/_components/AdminDashboard/components/PlatformBulletin"
import { StatusBreakdown } from "@/app/[locale]/(authenticated)/_components/AdminDashboard/components/StatusBreakdown"
import { TrustLeaderboard } from "@/app/[locale]/(authenticated)/_components/AdminDashboard/components/TrustLeaderboard"
import { UniversityKpiGrid } from "@/app/[locale]/(authenticated)/_components/AdminDashboard/components/UniversityKpiGrid"
import { useAdminDashboardData } from "@/app/[locale]/(authenticated)/_components/AdminDashboard/hooks/useAdminDashboardData"

interface AdminDashboardProps {
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const { isSuperAdmin, stats, universityStats, isLoading, trustIndices } =
    useAdminDashboardData(user.role)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[50vh]">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="absolute inset-0 border-2 border-foreground animate-ping opacity-20" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <DashboardHero isSuperAdmin={isSuperAdmin} />

      {/* Platform stats bar — super_admin only */}
      {isSuperAdmin && stats && <PlatformBulletin stats={stats} />}

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
