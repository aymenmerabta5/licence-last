"use client"

import { useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"

import { orpcClient } from "@/server/orpc/client"
import { useInfiniteScroll } from "@/hooks"
import type { ListPendingApplicationsResult } from "@/server/services/placements/list-pending"

export function useAdminValidations() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<ListPendingApplicationsResult>({
    queryKey: ["placements", "listPending"],
    queryFn: async ({ pageParam }) => {
      return orpcClient.placements.listPending({
        cursor: pageParam as { companyActionAt: string; id: string } | undefined,
        limit: 15,
      })
    },
    initialPageParam: undefined as
      | { companyActionAt: string; id: string }
      | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const applications = useMemo(
    () => data?.pages.flatMap((p) => p.applications) ?? [],
    [data],
  )

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage)

  return {
    applications,
    isLoading,
    isFetchingNextPage,
    sentinelRef,
  }
}
