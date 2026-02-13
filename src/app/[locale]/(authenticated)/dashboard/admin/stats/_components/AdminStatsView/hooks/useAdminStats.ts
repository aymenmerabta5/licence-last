"use client"

import { useQuery } from "@tanstack/react-query"

import { orpc } from "@/server/orpc/client"

export function useAdminStats() {
  const statsQuery = useQuery(orpc.stats.getAdminStats.queryOptions())
  const trustIndicesQuery = useQuery(
    orpc.companies.listTrustIndices.queryOptions({ input: { limit: 12 } }),
  )
  const reportsQuery = useQuery(
    orpc.companies.listReports.queryOptions({ input: { status: "open", limit: 12 } }),
  )

  return {
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    trustIndices: trustIndicesQuery.data ?? [],
    isTrustLoading: trustIndicesQuery.isLoading,
    reports: reportsQuery.data ?? [],
    isReportsLoading: reportsQuery.isLoading,
  }
}
