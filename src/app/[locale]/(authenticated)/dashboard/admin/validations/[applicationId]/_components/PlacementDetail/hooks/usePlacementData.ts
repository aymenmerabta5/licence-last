"use client"

import { useQuery } from "@tanstack/react-query"

import { orpc } from "@/server/orpc/client"

export function usePlacementData(applicationId: string) {
  const { data, isLoading } = useQuery({
    ...orpc.placements.listPending.queryOptions({}),
    enabled: !!applicationId,
  })

  const application = data?.applications.find((app) => app.id === applicationId)

  return { application, isLoading: isLoading || !applicationId }
}
