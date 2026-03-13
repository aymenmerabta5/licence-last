"use client"

import { useQuery } from "@tanstack/react-query"

import { orpc } from "@/server/orpc/client"

export function useDeptHeadPlacementData(applicationId: string) {
  const { data, isLoading } = useQuery({
    ...orpc.deptHead.getPendingById.queryOptions({
      input: { applicationId },
    }),
    enabled: !!applicationId,
  })

  const application = data?.application ?? null

  return { application, isLoading: isLoading || !applicationId }
}
