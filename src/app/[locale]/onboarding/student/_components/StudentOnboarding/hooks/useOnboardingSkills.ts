"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"

import { useDebounce } from "@/hooks/useDebounce"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import { orpcClient } from "@/server/orpc/client"

export function useOnboardingSkills(departmentId: string) {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)
  const searchKey = debouncedQuery.trim().toLowerCase()

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["onboarding", "skills", "by-category", departmentId || "__none__", searchKey || "__all__"],
    queryFn: async ({ pageParam }) => {
      return orpcClient.skills.listByCategory({
        query: searchKey || undefined,
        cursor: pageParam ?? undefined,
        limit: 5,
        departmentId: departmentId || undefined,
      })
    },
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : null,
  })

  const sentinelRef = useInfiniteScroll(
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  )

  // Aggregate loaded categories across all pages
  const loadedCategories = useMemo(() => {
    const pages = infiniteData?.pages ?? []
    const seen = new Set<number>()
    const result: Array<{
      id: number
      name: string
      slug: string
      isRecommended: boolean
      skills: Array<{ id: string; name: string }>
    }> = []

    for (const page of pages) {
      for (const cat of page.categories) {
        if (seen.has(cat.id)) continue
        seen.add(cat.id)
        result.push(cat)
      }
    }

    return result
  }, [infiniteData])

  // Build groups and category order for SkillCategoryGrid
  const groups = useMemo(() => {
    const map: Record<string, Array<{ id: string; name: string }>> = {}
    for (const cat of loadedCategories) {
      map[cat.slug] = cat.skills
    }
    return map
  }, [loadedCategories])

  const categoryOrder = useMemo(
    () => loadedCategories.map((c) => c.slug),
    [loadedCategories],
  )

  const categoryLabels = useMemo(() => {
    const map: Record<string, string> = {}
    for (const cat of loadedCategories) {
      map[cat.slug] = cat.name
    }
    return map
  }, [loadedCategories])

  const recommendedCategorySlugs = useMemo(() => {
    return new Set(
      loadedCategories.filter((c) => c.isRecommended).map((c) => c.slug),
    )
  }, [loadedCategories])

  const hasExactMatch = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return loadedCategories.some((cat) =>
      cat.skills.some((s) => s.name.toLowerCase() === q),
    )
  }, [loadedCategories, query])

  return {
    query,
    setQuery,
    groups,
    categoryOrder,
    categoryLabels,
    recommendedCategorySlugs,
    hasExactMatch,
    isLoading,
    isFetchingNextPage,
    sentinelRef,
  }
}
