"use client"

import { useMemo, useState, useCallback } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useSkillGrouping } from "@/hooks"
import { orpc } from "@/server/orpc/client"

export function useDepartmentSkills(departmentId: string, open: boolean) {
  const queryClient = useQueryClient()

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
  const [saveTick, setSaveTick] = useState(0)

  // Derive active IDs: user's draft if modified, otherwise server data
  const draftIds = draftOverride ?? currentSkillIds ?? []

  // Reset all local state when modal closes (called from onOpenChange wrapper)
  const resetState = useCallback(() => {
    setDraftOverride(null)
    setQuery("")
    setSaveError("")
    setSaveTick(0)
  }, [])

  const filteredSkills = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allSkills
    return allSkills.filter((s) => s.name.toLowerCase().includes(q))
  }, [allSkills, query])

  const { groups, categoryOrder, categoryLabels } = useSkillGrouping(filteredSkills)

  const syncMutation = useMutation(
    orpc.departments.syncSkills.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["departments"] })
        setDraftOverride(null)
        setSaveTick((t) => t + 1)
      },
    }),
  )

  const isDirty = useMemo(() => {
    if (!currentSkillIds || draftOverride === null) return false
    const current = [...currentSkillIds].sort().join(",")
    const draft = [...draftOverride].sort().join(",")
    return current !== draft
  }, [currentSkillIds, draftOverride])

  function toggleSkill(skillId: string) {
    setSaveError("")
    setSaveTick(0)
    setDraftOverride((prev) => {
      const base = prev ?? currentSkillIds ?? []
      if (base.includes(skillId)) return base.filter((id) => id !== skillId)
      if (base.length >= 200) return base
      return [...base, skillId]
    })
  }

  async function save() {
    setSaveError("")
    setSaveTick(0)
    try {
      await syncMutation.mutateAsync({
        departmentId,
        skillTagIds: draftIds,
      })
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not update skills.",
      )
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
    saveTick,
    groups,
    categoryOrder,
    categoryLabels,
    toggleSkill,
    save,
    resetState,
  }
}
