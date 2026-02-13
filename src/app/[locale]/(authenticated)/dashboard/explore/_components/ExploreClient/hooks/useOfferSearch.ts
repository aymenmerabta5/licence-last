"use client"

import { useState, useMemo } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import { orpcClient, orpc } from "@/server/orpc/client"
import { useInfiniteScroll, useDebounce } from "@/hooks"

export interface FilterState {
  wilayaCode?: number
  internshipTypes: string[]
  workModes: string[]
  skillTagIds: string[]
}

const EMPTY_FILTERS: FilterState = {
  internshipTypes: [],
  workModes: [],
  skillTagIds: [],
}

export function useOfferSearch() {
  const [keyword, setKeyword] = useState("")
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const debouncedKeyword = useDebounce(keyword, 300)

  const { data: skillsResult } = useQuery(orpc.skills.list.queryOptions())
  const skills = useMemo(() => skillsResult?.skills ?? [], [skillsResult])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["offers", "search", debouncedKeyword, filters],
    queryFn: async ({ pageParam }) => {
      return orpcClient.offers.search({
        keyword: debouncedKeyword || undefined,
        wilayaCode: filters.wilayaCode,
        internshipTypes:
          filters.internshipTypes.length > 0
            ? (filters.internshipTypes as ("pfe" | "immersion" | "summer" | "practical")[])
            : undefined,
        workModes:
          filters.workModes.length > 0
            ? (filters.workModes as ("on_site" | "hybrid" | "remote")[])
            : undefined,
        skillTagIds:
          filters.skillTagIds.length > 0 ? filters.skillTagIds : undefined,
        cursor: pageParam ?? undefined,
        limit: 12,
      })
    },
    initialPageParam: undefined as { createdAt: string; id: string } | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const offers = useMemo(
    () => data?.pages.flatMap((p) => p.offers) ?? [],
    [data],
  )

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage)

  const hasActiveFilters =
    !!filters.wilayaCode ||
    filters.internshipTypes.length > 0 ||
    filters.workModes.length > 0 ||
    filters.skillTagIds.length > 0

  const clearFilters = () => setFilters(EMPTY_FILTERS)

  return {
    keyword,
    setKeyword,
    filters,
    setFilters,
    skills,
    offers,
    isLoading,
    isFetchingNextPage,
    sentinelRef,
    hasActiveFilters,
    clearFilters,
  }
}
