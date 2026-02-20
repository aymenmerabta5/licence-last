"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useDebounce, useInfiniteScroll } from "@/hooks"
import { orpc, orpcClient } from "@/server/orpc/client"
import type {
  CompanyDirectoryCursor,
  CompanyDirectoryItem,
} from "@/app/[locale]/(authenticated)/dashboard/student/companies/_components/CompaniesDirectoryView/types"

const PAGE_SIZE = 12

export function useCompaniesDirectory() {
  const [keyword, setKeyword] = useState("")
  const [wilayaCode, setWilayaCode] = useState<number | undefined>(undefined)
  const debouncedKeyword = useDebounce(keyword, 300)

  const input = useMemo(
    () => ({
      ...(debouncedKeyword.trim() ? { keyword: debouncedKeyword.trim() } : {}),
      ...(wilayaCode ? { wilayaCode } : {}),
      limit: PAGE_SIZE,
    }),
    [debouncedKeyword, wilayaCode],
  )

  const queryKey = useMemo(
    () => orpc.companies.listPublicDirectory.queryOptions({ input }).queryKey,
    [input],
  )

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey,
      queryFn: async ({ pageParam }) =>
        orpcClient.companies.listPublicDirectory({
          ...input,
          cursor: (pageParam as CompanyDirectoryCursor | undefined) ?? undefined,
        }),
      initialPageParam: undefined as CompanyDirectoryCursor | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

  const companies = useMemo<CompanyDirectoryItem[]>(
    () => data?.pages.flatMap((page) => page.companies) ?? [],
    [data],
  )

  const sentinelRef = useInfiniteScroll(
    () => {
      void fetchNextPage()
    },
    hasNextPage,
    isFetchingNextPage,
  )

  const hasActiveFilters = Boolean(keyword.trim()) || Boolean(wilayaCode)

  return {
    keyword,
    setKeyword,
    wilayaCode,
    setWilayaCode,
    companies,
    isLoading,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    sentinelRef,
    hasActiveFilters,
    clearFilters: () => {
      setKeyword("")
      setWilayaCode(undefined)
    },
  }
}
