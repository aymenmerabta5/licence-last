"use client"

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"

import { useDebounce } from "@/hooks/useDebounce"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import { orpc, orpcClient } from "@/server/orpc/client"

const DEPARTMENTS_LIST_QUERY_PATH = orpc.departments.list.queryOptions({
  input: { universityId: "__all__" },
}).queryKey[0]

export function useDepartmentSkills(departmentId: string, open: boolean) {
  const queryClient = useQueryClient()
  const departmentSkillsQueryKey = orpc.departments.getSkills.queryOptions({
    input: { departmentId },
  }).queryKey
  const allSkillsQueryKey = orpc.skills.list.queryOptions({
    input: { limit: 500 },
  }).queryKey

  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)
  const [saveError, setSaveError] = useState("")

  // Track if search is active to drive the infinite query key
  const searchKey = debouncedQuery.trim().toLowerCase()

  // Fetch current department skill assignment
  const { data: currentSkillIds, isLoading: isLoadingCurrent } = useQuery({
    ...orpc.departments.getSkills.queryOptions({
      input: { departmentId },
    }),
    enabled: open && !!departmentId,
  })

  // Draft override: null = use server data, non-null = user has modified
  const [draftOverride, setDraftOverride] = useState<string[] | null>(null)

  // Derive active IDs: user's draft if modified, otherwise server data
  const draftIds = draftOverride ?? currentSkillIds ?? []

  // Infinite scroll: load skills grouped by category
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingInfinite,
  } = useInfiniteQuery({
    queryKey: ["skills", "by-category", searchKey || "__all__"],
    queryFn: async ({ pageParam }) => {
      return orpcClient.skills.listByCategory({
        query: searchKey || undefined,
        cursor: pageParam ?? undefined,
        limit: 5,
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

  const hasExactMatch = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return loadedCategories.some((cat) =>
      cat.skills.some((s) => s.name.toLowerCase() === q),
    )
  }, [loadedCategories, query])

  // Reset all local state when modal closes
  const resetState = useCallback(() => {
    setDraftOverride(null)
    setQuery("")
    setSaveError("")
  }, [])

  const syncMutation = useMutation({
    ...orpc.departments.syncSkills.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: departmentSkillsQueryKey })
      await queryClient.cancelQueries({
        queryKey: [DEPARTMENTS_LIST_QUERY_PATH],
      })

      const previousSkills = queryClient.getQueryData(departmentSkillsQueryKey)
      queryClient.setQueryData(departmentSkillsQueryKey, variables.skillTagIds)

      const listQueries = queryClient.getQueriesData({
        queryKey: [DEPARTMENTS_LIST_QUERY_PATH],
      })
      for (const [queryKey, data] of listQueries) {
        if (!Array.isArray(data)) continue
        queryClient.setQueryData(
          queryKey,
          data.map((dept) =>
            dept.id === variables.departmentId
              ? { ...dept, skillCount: variables.skillTagIds.length }
              : dept,
          ),
        )
      }

      return { previousSkills, previousLists: listQueries }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [DEPARTMENTS_LIST_QUERY_PATH],
        }),
        queryClient.invalidateQueries({
          queryKey: departmentSkillsQueryKey,
        }),
      ])
      setDraftOverride(null)
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSkills !== undefined) {
        queryClient.setQueryData(
          departmentSkillsQueryKey,
          context.previousSkills,
        )
      }
      for (const [queryKey, data] of context?.previousLists ?? []) {
        queryClient.setQueryData(queryKey, data)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: departmentSkillsQueryKey })
      queryClient.invalidateQueries({
        queryKey: [DEPARTMENTS_LIST_QUERY_PATH],
      })
    },
  })

  const createSkillMutation = useMutation({
    mutationFn: async ({ name, force }: { name: string; force?: boolean }) =>
      orpcClient.skills.create({ name, category: "other", force }),
    onSuccess: async (data) => {
      if ("id" in data) {
        await queryClient.invalidateQueries({
          queryKey: allSkillsQueryKey,
        })
      }
    },
  })

  const isDirty = useMemo(() => {
    if (!currentSkillIds || draftOverride === null) return false
    const current = [...currentSkillIds].sort().join(",")
    const draft = [...draftOverride].sort().join(",")
    return current !== draft
  }, [currentSkillIds, draftOverride])

  function toggleSkill(skillId: string) {
    setSaveError("")
    setDraftOverride((prev) => {
      const base = prev ?? currentSkillIds ?? []
      if (base.includes(skillId)) return base.filter((id) => id !== skillId)
      if (base.length >= 200) return base
      return [...base, skillId]
    })
  }

  function toggleCategory(_category: string, skillIds: string[]) {
    setSaveError("")
    setDraftOverride((prev) => {
      const base = prev ?? currentSkillIds ?? []
      const allSelected = skillIds.every((id) => base.includes(id))

      if (allSelected) {
        return base.filter((id) => !skillIds.includes(id))
      }

      const toAdd = skillIds.filter(
        (id) => !base.includes(id) && base.length < 200,
      )
      return [...base, ...toAdd]
    })
  }

  function clearAll() {
    setSaveError("")
    setDraftOverride([])
  }

  async function save() {
    setSaveError("")
    try {
      await syncMutation.mutateAsync({
        departmentId,
        skillTagIds: draftIds,
      })
      return true
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not update skills.",
      )
      return false
    }
  }

  return {
    query,
    setQuery,
    draftIds,
    allSkills: [],
    assignedCategories: [],
    isLoading: isLoadingInfinite || isLoadingCurrent,
    isSaving: syncMutation.isPending,
    isDirty,
    saveError,
    groups,
    categoryOrder,
    categoryLabels,
    hasExactMatch,
    toggleSkill,
    toggleCategory,
    clearAll,
    save,
    resetState,
    createSkill: createSkillMutation.mutateAsync,
    isCreatingSkill: createSkillMutation.isPending,
    sentinelRef,
    isFetchingNextPage,
  }
}
