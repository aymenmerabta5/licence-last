"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"

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

  const filteredSkills = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allSkills
    return allSkills.filter((s) => s.name.toLowerCase().includes(q))
  }, [allSkills, query])

  const hasExactMatch = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return allSkills.some((s) => s.name.toLowerCase() === q)
  }, [allSkills, query])

  const { groups, categoryOrder, categoryLabels } =
    useSkillGrouping(filteredSkills)

  const syncMutation = useMutation(
    orpc.departments.syncSkills.mutationOptions({
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
    }),
  )

  const createSkillMutation = useMutation({
    mutationFn: (name: string) =>
      orpcClient.skills.create({ name, category: "other" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: allSkillsQueryKey,
      })
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
    isLoading: isLoadingSkills || isLoadingCurrent,
    isSaving: syncMutation.isPending,
    isDirty,
    saveError,
    groups,
    categoryOrder,
    categoryLabels,
    hasExactMatch,
    toggleSkill,
    save,
    resetState,
    createSkill: createSkillMutation.mutateAsync,
    isCreatingSkill: createSkillMutation.isPending,
  }
}
