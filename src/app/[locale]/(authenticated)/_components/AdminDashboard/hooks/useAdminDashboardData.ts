"use client"

import { useQuery } from "@tanstack/react-query"

import { orpc, type orpcClient } from "@/server/orpc/client"

export type AdminStats = Awaited<
  ReturnType<typeof orpcClient.stats.getAdminStats>
>
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

const STALE_TIME_MS = 5 * 60 * 1000

export function useAdminDashboardData(
  role: string,
  initialData?: AdminDashboardInitialData,
) {
  const isSuperAdmin = role === "super_admin"
  const isUniversityAdmin = role === "university_admin"

  // Platform-wide stats — super_admin only
  const statsQuery = useQuery({
    ...orpc.stats.getAdminStats.queryOptions(),
    enabled: isSuperAdmin,
    initialData: initialData?.stats,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
  })

  // University-scoped dashboard metrics — university_admin only
  const universityStatsQuery = useQuery({
    ...orpc.stats.getUniversityDashboardStats.queryOptions(),
    enabled: isUniversityAdmin,
    initialData: initialData?.universityStats,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
  })

  // Trust indices — super_admin only
  const trustQuery = useQuery({
    ...orpc.companies.listTrustIndices.queryOptions({ input: { limit: 5 } }),
    enabled: isSuperAdmin,
    initialData: initialData?.trustIndices,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
  })

  return {
    isSuperAdmin,
    stats: statsQuery.data,
    universityStats: universityStatsQuery.data,
    trustIndices: trustQuery.data ?? [],
    isLoading: isSuperAdmin
      ? statsQuery.isLoading
      : universityStatsQuery.isLoading,
  }
}
