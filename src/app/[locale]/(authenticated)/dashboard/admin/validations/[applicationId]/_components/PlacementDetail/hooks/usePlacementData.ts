"use client"

import { useQuery } from "@tanstack/react-query"

import { orpc } from "@/server/orpc/client"

export function usePlacementData(applicationId: string) {
  const { data, isLoading } = useQuery({
    ...orpc.placements.getPendingById.queryOptions({
      input: { applicationId },
    }),
    enabled: !!applicationId,
  })

  const application = data?.application ?? null

  return { application, isLoading: isLoading || !applicationId }
}
