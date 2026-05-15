"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"

import { useSkillGrouping } from "@/hooks"
import { orpc, orpcClient } from "@/server/orpc/client"

const FIELDS_LIST_QUERY_PATH = orpc.fields.list.queryOptions().queryKey[0]

export function useFieldSkills(fieldId: string, open: boolean) {
  const queryClient = useQueryClient()
  const fieldSkillsQueryKey = orpc.fields.getSkills.queryOptions({
    input: { fieldId },
  }).queryKey
  const allSkillsQueryKey = orpc.skills.list.queryOptions({
    input: { limit: 500 },
  }).queryKey

  const { data: allSkillsResult, isLoading: isLoadingSkills } = useQuery(
    orpc.skills.list.queryOptions({ input: { limit: 500 } }),
  )
  const allSkills = useMemo(
    () => allSkillsResult?.skills ?? [],
    [allSkillsResult?.skills],
  )

  const { data: currentSkillIds, isLoading: isLoadingCurrent } = useQuery({
    ...orpc.fields.getSkills.queryOptions({
      input: { fieldId },
    }),
    enabled: open && !!fieldId,
  })

  const [draftOverride, setDraftOverride] = useState<string[] | null>(null)
  const [query, setQuery] = useState("")
  const [saveError, setSaveError] = useState("")

  const draftIds = draftOverride ?? currentSkillIds ?? []

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

  const syncMutation = useMutation({
    ...orpc.fields.syncSkills.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: fieldSkillsQueryKey })
      await queryClient.cancelQueries({
        queryKey: [FIELDS_LIST_QUERY_PATH],
      })

      const previousSkills = queryClient.getQueryData(fieldSkillsQueryKey)
      const skillTagIds = variables.skills.map((s) => s.skillTagId)
      queryClient.setQueryData(fieldSkillsQueryKey, skillTagIds)

      const listQueries = queryClient.getQueriesData({
        queryKey: [FIELDS_LIST_QUERY_PATH],
      })
      for (const [queryKey, data] of listQueries) {
        if (!data || typeof data !== "object" || Array.isArray(data) || !Array.isArray((data as Record<string, unknown>).fields))
          continue
        queryClient.setQueryData(queryKey, {
          ...data,
          fields: (data as Record<string, Array<{ id: string; skillCount: number }>>).fields.map((fld) =>
            fld.id === variables.fieldId
              ? { ...fld, skillCount: variables.skills.length }
              : fld,
          ),
        })
      }

      return { previousSkills, previousLists: listQueries }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [FIELDS_LIST_QUERY_PATH],
        }),
        queryClient.invalidateQueries({
          queryKey: fieldSkillsQueryKey,
        }),
      ])
      setDraftOverride(null)
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSkills !== undefined) {
        queryClient.setQueryData(fieldSkillsQueryKey, context.previousSkills)
      }
      for (const [queryKey, data] of context?.previousLists ?? []) {
        queryClient.setQueryData(queryKey, data)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: fieldSkillsQueryKey })
      queryClient.invalidateQueries({
        queryKey: [FIELDS_LIST_QUERY_PATH],
      })
    },
  })

  const createSkillMutation = useMutation({
    mutationFn: async ({
      name,
      force,
    }: {
      name: string
      force?: boolean
    }) => orpcClient.skills.create({ name, category: "other", force }),
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

  async function save() {
    setSaveError("")
    try {
      await syncMutation.mutateAsync({
        fieldId,
        skills: draftIds.map((id) => ({ skillTagId: id })),
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
