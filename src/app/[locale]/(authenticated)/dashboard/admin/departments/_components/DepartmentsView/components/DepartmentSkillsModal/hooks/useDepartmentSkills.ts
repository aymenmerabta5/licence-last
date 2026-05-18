"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useState } from "react"

import { useSkillGrouping } from "@/hooks"
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

  // Fetch all skills (admin picks from the full pool)
  const { data: allSkillsResult, isLoading: isLoadingSkills } = useQuery(
    orpc.skills.list.queryOptions({ input: { limit: 500 } }),
  )
  const allSkills = useMemo(
    () => allSkillsResult?.skills ?? [],
    [allSkillsResult?.skills],
  )

  // Fetch assigned categories for this department
  const { data: assignedCategories, isLoading: isLoadingCategories } = useQuery(
    orpc.departments.listCategories.queryOptions({
      input: { departmentId },
    }),
  )

  const assignedCategorySlugs = useMemo(() => {
    return new Set((assignedCategories ?? []).map((c) => c.slug))
  }, [assignedCategories])

  // Fetch current department skill assignment
  const { data: currentSkillIds, isLoading: isLoadingCurrent } = useQuery({
    ...orpc.departments.getSkills.queryOptions({
      input: { departmentId },
    }),
    enabled: open && !!departmentId,
  })

  // Draft override: null = use server data, non-null = user has modified
  const [draftOverride, setDraftOverride] = useState<string[] | null>(null)
  const [query, setQuery] = useState("")
  const [saveError, setSaveError] = useState("")

  // Derive active IDs: user's draft if modified, otherwise server data
  const draftIds = draftOverride ?? currentSkillIds ?? []

  // Reset all local state when modal closes (called from onOpenChange wrapper)
  const resetState = useCallback(() => {
    setDraftOverride(null)
    setQuery("")
    setSaveError("")
  }, [])

  // Remove deselected categories from draft so hidden skills don't persist
  useEffect(() => {
    if (!assignedCategories || allSkills.length === 0) return
    const validSlugs = new Set(assignedCategories.map((c) => c.slug))
    const validIds = new Set(
      allSkills
        .filter((s) => validSlugs.has(s.category ?? "general"))
        .map((s) => s.id),
    )
    setDraftOverride((prev) => {
      if (prev === null) return null
      const next = prev.filter((id) => validIds.has(id))
      return next.length === prev.length ? prev : next
    })
  }, [assignedCategories, allSkills])

  const filteredSkills = useMemo(() => {
    // Only show skills from categories assigned to this department
    const pool =
      assignedCategorySlugs.size > 0
        ? allSkills.filter((s) => assignedCategorySlugs.has(s.category ?? "general"))
        : []

    const q = query.trim().toLowerCase()
    if (!q) return pool
    return pool.filter((s) => s.name.toLowerCase().includes(q))
  }, [allSkills, assignedCategorySlugs, query])

  const hasExactMatch = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return filteredSkills.some((s) => s.name.toLowerCase() === q)
  }, [filteredSkills, query])

  const { groups, categoryOrder, categoryLabels } =
    useSkillGrouping(filteredSkills)

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
    allSkills,
    assignedCategories: assignedCategories ?? [],
    isLoading: isLoadingSkills || isLoadingCurrent || isLoadingCategories,
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
  }
}
