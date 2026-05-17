"use client"

import type { InferRouterOutputs } from "@orpc/server"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useInfiniteScroll } from "@/hooks"
import { orpcClient } from "@/server/orpc/client"
import type { AppRouter } from "@/server/orpc/router"

type ListPendingApplicationsResult =
  InferRouterOutputs<AppRouter>["deptHead"]["listPending"]

const STALE_TIME_MS = 5 * 60 * 1000

export function useDeptHeadData() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<ListPendingApplicationsResult>({
      queryKey: ["deptHead", "listPending"],
      queryFn: async ({ pageParam }) => {
        return orpcClient.deptHead.listPending({
          cursor: pageParam as
            | { companyActionAt: string; id: string }
            | undefined,
          limit: 15,
        })
      },
      initialPageParam: undefined as
        | { companyActionAt: string; id: string }
        | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: STALE_TIME_MS,
      refetchOnWindowFocus: false,
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
