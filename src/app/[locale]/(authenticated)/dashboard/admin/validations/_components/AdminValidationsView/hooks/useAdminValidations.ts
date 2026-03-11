"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useInfiniteScroll } from "@/hooks"
import { orpcClient } from "@/server/orpc/client"
import type { ListPendingApplicationsResult } from "@/server/services/placements/list-pending"

function unwrapORPCPayload<T>(value: T | { json: T }): T {
  if (typeof value === "object" && value !== null && "json" in value) {
    return (value as { json: T }).json
  }

  return value as T
}

export function useAdminValidations() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<ListPendingApplicationsResult>({
      queryKey: ["placements", "listPending"],
      queryFn: async ({ pageParam }) =>
        unwrapORPCPayload<ListPendingApplicationsResult>(
          await orpcClient.placements.listPending({
            cursor: pageParam as
              | { companyActionAt: string; id: string }
              | undefined,
            limit: 15,
          }),
        ),
      initialPageParam: undefined as
        | { companyActionAt: string; id: string }
        | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

  const applications = useMemo(
    () => data?.pages.flatMap((p) => p.applications) ?? [],
    [data],
  )

  const sentinelRef = useInfiniteScroll(
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  )

  return {
    applications,
    isLoading,
    isFetchingNextPage,
    sentinelRef,
  }
}
