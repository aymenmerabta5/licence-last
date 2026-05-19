"use client"

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { useDebounce } from "@/hooks/useDebounce"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import { orpc, orpcClient } from "@/server/orpc/client"

const MAX_SKILLS = 10

export function useSkillsManager() {
  const t = useTranslations("dashboard.settings.skillsManager")
  const queryClient = useQueryClient()

  const profileQueryOptions = useMemo(
    () => orpc.students.getProfile.queryOptions(),
    [],
  )
  const { data: profileData, isLoading: isLoadingProfile } =
    useQuery(profileQueryOptions)

  const departmentId = profileData?.profile?.departmentId ?? undefined

  // Load all skills for the selected skills bar name lookup
  const { data: allSkillsResult } = useQuery(
    orpc.skills.list.queryOptions({ input: { limit: 500 } }),
  )
  const allSkills = useMemo(
    () => allSkillsResult?.skills ?? [],
    [allSkillsResult?.skills],
  )

  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)
  const searchKey = debouncedQuery.trim().toLowerCase()

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingInfinite,
  } = useInfiniteQuery({
    queryKey: [
      "settings",
      "skills",
      "by-category",
      departmentId || "__none__",
      searchKey || "__all__",
    ],
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

  const initialSkillIds = useMemo(() => {
    const ids = profileData?.skills?.map((s) => s.id) ?? []
    return Array.from(new Set(ids))
  }, [profileData?.skills])

  const [draftSelectedIds, setDraftSelectedIds] = useState<string[] | null>(
    null,
  )
  const [saveError, setSaveError] = useState("")
  const [saveTick, setSaveTick] = useState(0)

  const selectedIds = draftSelectedIds ?? initialSkillIds

  const upsertMutation = useMutation({
    ...orpc.students.upsertSkills.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: profileQueryOptions.queryKey,
      })
      const previousData = queryClient.getQueryData(
        profileQueryOptions.queryKey,
      )
      queryClient.setQueryData(profileQueryOptions.queryKey, (old) => {
        if (!old) return old
        const nextSkills = allSkills.filter((s) =>
          variables.skillTagIds.includes(s.id),
        )
        return { ...old, skills: nextSkills }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          profileQueryOptions.queryKey,
          context.previousData,
        )
      }
    },
    onSuccess: () => {
      setDraftSelectedIds(null)
      setSaveTick((t) => t + 1)
      toast.success(t("saveSuccess"))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryOptions.queryKey })
    },
  })

  const isBusy = isLoadingInfinite || isLoadingProfile || upsertMutation.isPending
  const isAtMax = selectedIds.length >= MAX_SKILLS
  const isDirty =
    draftSelectedIds !== null &&
    selectedIds.join(",") !== initialSkillIds.join(",")

  function toggleSkill(skillId: string) {
    setSaveError("")
    setSaveTick(0)

    setDraftSelectedIds((prev) => {
      const base = prev ?? initialSkillIds
      const isSelected = base.includes(skillId)
      if (isSelected) return base.filter((id) => id !== skillId)
      if (base.length >= MAX_SKILLS) return base
      return [...base, skillId]
    })
  }

  async function save() {
    setSaveError("")
    setSaveTick(0)

    if (selectedIds.length < 1) {
      setSaveError(t("minRequired"))
      return
    }

    try {
      await upsertMutation.mutateAsync({ skillTagIds: selectedIds })
    } catch {
      const message = t("saveError")
      setSaveError(message)
      toast.error(message)
    }
  }

  return {
    query,
    setQuery,
    selectedIds,
    allSkills,
    isLoadingSkills: isLoadingInfinite,
    isBusy,
    isAtMax,
    isDirty,
    isSaving: upsertMutation.isPending,
    saveError,
    saveTick,
    groups,
    categoryOrder,
    categoryLabels,
    recommendedCategorySlugs,
    toggleSkill,
    save,
    maxSkills: MAX_SKILLS,
    sentinelRef,
    isFetchingNextPage,
  }
}
