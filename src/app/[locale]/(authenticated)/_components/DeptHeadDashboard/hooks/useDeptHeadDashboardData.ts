"use client"

import { useQuery } from "@tanstack/react-query"
import type { PendingApplicationItem } from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/types"
import { orpc } from "@/server/orpc/client"

export function useDeptHeadDashboardData() {
  const { data: pendingResult, isLoading } = useQuery(
    orpc.deptHead.listPending.queryOptions({
      input: { limit: 6 },
    }),
  )

  const applications = (pendingResult?.applications ??
    []) as PendingApplicationItem[]
  const pendingCount = pendingResult?.hasMore
    ? `${applications.length}+`
    : `${applications.length}`
  const queueIsBusy = Boolean(pendingResult?.hasMore)

  return {
    applications,
    pendingCount,
    queueIsBusy,
    isLoading,
  }
}
