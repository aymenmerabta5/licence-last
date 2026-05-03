"use client"

import { useQuery } from "@tanstack/react-query"
import type { PendingApplicationItem } from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/types"
import { orpc } from "@/server/orpc/client"
import type { ListPendingApplicationsResult } from "@/server/services/placements/list-pending"

export interface DeptHeadDashboardInitialData {
  initialPendingResult?: ListPendingApplicationsResult
}

const STALE_TIME_MS = 5 * 60 * 1000

export function useDeptHeadDashboardData(
  initialData?: DeptHeadDashboardInitialData,
) {
  const { data: pendingResult, isLoading } = useQuery({
    ...orpc.deptHead.listPending.queryOptions({
      input: { limit: 6 },
    }),
    initialData: initialData?.initialPendingResult,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
  })

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
