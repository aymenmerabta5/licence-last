"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { useSkillGrouping } from "@/hooks"
import { orpc } from "@/server/orpc/client"

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

  // Fetch prioritized skills when student has a department
  const departmentId = profileData?.profile?.departmentId ?? undefined

  const { data: prioritizedResult, isLoading: isLoadingPrioritized } = useQuery(
    {
      ...orpc.skills.listPrioritized.queryOptions({
        input: { departmentId: departmentId ?? "" },
      }),
      enabled: !!departmentId,
    },
  )

  const { data: flatResult, isLoading: isLoadingFlat } = useQuery({
    ...orpc.skills.list.queryOptions({ input: { limit: 500 } }),
    enabled: !departmentId,
  })

  const isLoadingSkills = departmentId ? isLoadingPrioritized : isLoadingFlat

  const deptSkills = useMemo(
    () => prioritizedResult?.departmentSkills ?? [],
    [prioritizedResult?.departmentSkills],
  )
  const otherSkillsRaw = useMemo(
    () =>
      departmentId
        ? (prioritizedResult?.otherSkills ?? [])
        : (flatResult?.skills ?? []),
    [departmentId, prioritizedResult?.otherSkills, flatResult?.skills],
  )
  const allSkills = useMemo(
    () => [...deptSkills, ...otherSkillsRaw],
    [deptSkills, otherSkillsRaw],
  )

  const initialSkillIds = useMemo(() => {
    const ids = profileData?.skills?.map((s) => s.id) ?? []
    return Array.from(new Set(ids))
  }, [profileData?.skills])

  const [query, setQuery] = useState("")
  const [draftSelectedIds, setDraftSelectedIds] = useState<string[] | null>(
    null,
  )
  const [saveError, setSaveError] = useState("")
  const [saveTick, setSaveTick] = useState(0)

  const selectedIds = draftSelectedIds ?? initialSkillIds

  const filteredDeptSkills = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return deptSkills
    return deptSkills.filter((s) => s.name.toLowerCase().includes(q))
  }, [deptSkills, query])

  const filteredOtherSkills = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return otherSkillsRaw
    return otherSkillsRaw.filter((s) => s.name.toLowerCase().includes(q))
  }, [otherSkillsRaw, query])

  const filteredSkills = useMemo(
    () => [...filteredDeptSkills, ...filteredOtherSkills],
    [filteredDeptSkills, filteredOtherSkills],
  )

  const deptGrouping = useSkillGrouping(filteredDeptSkills)
  const otherGrouping = useSkillGrouping(filteredOtherSkills)
  const { groups, categoryOrder, categoryLabels } =
    useSkillGrouping(filteredSkills)

  const upsertMutation = useMutation({
    ...orpc.students.upsertSkills.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: profileQueryOptions.queryKey })
      const previousData = queryClient.getQueryData(profileQueryOptions.queryKey)
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
    deptGrouping,
    otherGrouping,
    hasDeptSkills: deptSkills.length > 0,
    toggleSkill,
    save,
    maxSkills: MAX_SKILLS,
  }
}
