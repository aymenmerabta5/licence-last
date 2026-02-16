"use client"

import { useQuery } from "@tanstack/react-query"

import { orpc } from "@/server/orpc/client"

export function useAdminDashboardData(role: string) {
  const isSuperAdmin = role === "super_admin"
  const isUniversityAdmin = role === "university_admin"

  // Platform-wide stats — super_admin only
  const statsQuery = useQuery({
    ...orpc.stats.getAdminStats.queryOptions(),
    enabled: isSuperAdmin,
  })

  // University-scoped dashboard metrics — university_admin only
  const universityStatsQuery = useQuery({
    ...orpc.stats.getUniversityDashboardStats.queryOptions(),
    enabled: isUniversityAdmin,
  })

  // Trust indices — super_admin only
  const trustQuery = useQuery({
    ...orpc.companies.listTrustIndices.queryOptions({ input: { limit: 5 } }),
    enabled: isSuperAdmin,
  })

  return {
    isSuperAdmin,
    stats: statsQuery.data,
    universityStats: universityStatsQuery.data,
    isStatsLoading: statsQuery.isLoading && isSuperAdmin,
    trustIndices: trustQuery.data ?? [],
    isLoading: isSuperAdmin
      ? statsQuery.isLoading
      : universityStatsQuery.isLoading,
  }
}
