"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useDebounce, useInfiniteScroll } from "@/hooks"
import { orpc, orpcClient } from "@/server/orpc/client"

const PAGE_SIZE = 20

export function useUserManagement() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const debouncedSearch = useDebounce(search, 300)

  const baseInput = useMemo(
    () => ({
      ...(debouncedSearch && {
        searchValue: debouncedSearch,
        searchField: "email" as const,
        searchOperator: "contains" as const,
      }),
      ...(roleFilter !== "all" && {
        filterField: "role" as const,
        filterValue: roleFilter,
        filterOperator: "eq" as const,
      }),
      sortBy: "createdAt" as const,
      sortDirection: "desc" as const,
    }),
    [debouncedSearch, roleFilter],
  )

  const queryKey = useMemo(
    () => orpc.adminUsers.list.queryOptions({ input: baseInput }).queryKey,
    [baseInput],
  )

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) =>
      orpcClient.adminUsers.list({
        ...baseInput,
        limit: PAGE_SIZE,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit
      if (nextOffset >= lastPage.total) return undefined
      return nextOffset
    },
  })

  const users = useMemo(
    () => data?.pages.flatMap((page) => page.users) ?? [],
    [data],
  )

  const total = data?.pages[0]?.total ?? 0

  const sentinelRef = useInfiniteScroll(
    () => {
      void fetchNextPage()
    },
    hasNextPage,
    isFetchingNextPage,
  )

  return {
    users,
    total,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    sentinelRef,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    refetch,
  }
}
