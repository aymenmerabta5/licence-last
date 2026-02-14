"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useSkillGrouping } from "@/hooks"
import { orpc } from "@/server/orpc/client"

const MAX_SKILLS = 10

export function useSkillsManager() {
  const queryClient = useQueryClient()

  const profileQueryOptions = useMemo(
    () => orpc.students.getProfile.queryOptions(),
    [],
  )
  const { data: profileData, isLoading: isLoadingProfile } = useQuery(
    profileQueryOptions,
  )

  // Filter skills by student's department when available
  const departmentId = profileData?.profile?.departmentId ?? undefined
  const skillsQueryOptions = useMemo(
    () => orpc.skills.list.queryOptions({
      input: departmentId ? { departmentId } : undefined,
    }),
    [departmentId],
  )

  const { data: allSkillsResult, isLoading: isLoadingSkills } = useQuery(
    skillsQueryOptions,
  )

  const allSkills = useMemo(
    () => allSkillsResult?.skills ?? [],
    [allSkillsResult?.skills],
  )

  const initialSkillIds = useMemo(() => {
    const ids = profileData?.skills?.map((s) => s.id) ?? []
    return Array.from(new Set(ids))
  }, [profileData?.skills])

  const [query, setQuery] = useState("")
  const [draftSelectedIds, setDraftSelectedIds] = useState<string[] | null>(null)
  const [saveError, setSaveError] = useState("")
  const [saveTick, setSaveTick] = useState(0)

  const selectedIds = draftSelectedIds ?? initialSkillIds

  const filteredSkills = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allSkills
    return allSkills.filter((s) => s.name.toLowerCase().includes(q))
  }, [allSkills, query])

  const { groups, categoryOrder, categoryLabels } = useSkillGrouping(filteredSkills)

  const upsertMutation = useMutation(
    orpc.students.upsertProfile.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: profileQueryOptions.queryKey })
        setDraftSelectedIds(null)
        setSaveTick((t) => t + 1)
      },
    }),
  )

  const isBusy = isLoadingSkills || isLoadingProfile || upsertMutation.isPending
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
      setSaveError("Select at least 1 skill.")
      return
    }

    try {
      await upsertMutation.mutateAsync({ skillTagIds: selectedIds })
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save skills.")
    }
  }

  return {
    query,
    setQuery,
    selectedIds,
    allSkills,
    isLoadingSkills,
    isBusy,
    isAtMax,
    isDirty,
    isSaving: upsertMutation.isPending,
    saveError,
    saveTick,
    groups,
    categoryOrder,
    categoryLabels,
    toggleSkill,
    save,
    maxSkills: MAX_SKILLS,
  }
}
