"use client"

import { useQuery } from "@tanstack/react-query"
import { orpc } from "@/server/orpc/client"

export function useAdminDashboardData(role: string) {
  const isSuperAdmin = role === "super_admin"

  // Platform-wide stats — super_admin only
  const statsQuery = useQuery({
    ...orpc.stats.getAdminStats.queryOptions(),
    enabled: isSuperAdmin,
  })

  // Pending placements — available to university_admin + super_admin
  const pendingQuery = useQuery(
    orpc.placements.listPending.queryOptions({ input: { limit: 5 } }),
  )

  // Trust indices — super_admin only
  const trustQuery = useQuery({
    ...orpc.companies.listTrustIndices.queryOptions({ input: { limit: 5 } }),
    enabled: isSuperAdmin,
  })

  // Open reports — super_admin only
  const reportsQuery = useQuery({
    ...orpc.companies.listReports.queryOptions({
      input: { status: "open", limit: 5 },
    }),
    enabled: isSuperAdmin,
  })

  return {
    isSuperAdmin,
    stats: statsQuery.data,
    isStatsLoading: statsQuery.isLoading && isSuperAdmin,
    pendingPlacements: pendingQuery.data?.applications ?? [],
    pendingCount: pendingQuery.data?.applications?.length ?? 0,
    hasPendingMore: !!pendingQuery.data?.nextCursor,
    isPendingLoading: pendingQuery.isLoading,
    trustIndices: trustQuery.data ?? [],
    openReportsCount: reportsQuery.data?.length ?? 0,
    isLoading:
      (isSuperAdmin && statsQuery.isLoading) || pendingQuery.isLoading,
  }
}
