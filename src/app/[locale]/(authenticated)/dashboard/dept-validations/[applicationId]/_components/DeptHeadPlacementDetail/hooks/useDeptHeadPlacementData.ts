"use client"

import { useQuery } from "@tanstack/react-query"

import { orpc } from "@/server/orpc/client"

const STALE_TIME_MS = 5 * 60 * 1000

export function useDeptHeadPlacementData(applicationId: string) {
  const { data, isLoading } = useQuery({
    ...orpc.deptHead.getPendingById.queryOptions({
      input: { applicationId },
    }),
    enabled: !!applicationId,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
  })

  const application = data?.application ?? null

  return { application, isLoading: isLoading || !applicationId }
}
