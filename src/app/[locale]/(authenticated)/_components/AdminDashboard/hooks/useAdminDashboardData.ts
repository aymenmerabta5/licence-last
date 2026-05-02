"use client"

import { useQuery } from "@tanstack/react-query"

import { orpc, type orpcClient } from "@/server/orpc/client"

export type AdminStats = Awaited<ReturnType<typeof orpcClient.stats.getAdminStats>>
export type UniversityDashboardStats = Awaited<
  ReturnType<typeof orpcClient.stats.getUniversityDashboardStats>
>
export type TrustIndex = Awaited<
  ReturnType<typeof orpcClient.companies.listTrustIndices>
>[number]

interface AdminDashboardInitialData {
  stats?: AdminStats
  universityStats?: UniversityDashboardStats
  trustIndices?: TrustIndex[]
}

export function useAdminDashboardData(
  role: string,
  initialData?: AdminDashboardInitialData,
) {
  const isSuperAdmin = role === "super_admin"
  const isUniversityAdmin = role === "university_admin"

  // Platform-wide stats — super_admin only
  const statsQuery = useQuery({
    ...orpc.stats.getAdminStats.queryOptions(),
    enabled: isSuperAdmin && initialData?.stats === undefined,
    initialData: initialData?.stats,
  })

  // University-scoped dashboard metrics — university_admin only
  const universityStatsQuery = useQuery({
    ...orpc.stats.getUniversityDashboardStats.queryOptions(),
    enabled: isUniversityAdmin && initialData?.universityStats === undefined,
    initialData: initialData?.universityStats,
  })

  // Trust indices — super_admin only
  const trustQuery = useQuery({
    ...orpc.companies.listTrustIndices.queryOptions({ input: { limit: 5 } }),
    enabled: isSuperAdmin && initialData?.trustIndices === undefined,
    initialData: initialData?.trustIndices,
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
