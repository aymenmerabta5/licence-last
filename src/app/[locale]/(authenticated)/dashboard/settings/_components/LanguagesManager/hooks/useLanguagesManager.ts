"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { isLanguageCode, type LanguageCode } from "@/lib/constants/languages"
import type { ProficiencyLevel } from "@/lib/schemas/enums"
import { orpc } from "@/server/orpc/client"

interface StudentLanguageValue {
  languageCode: LanguageCode
  proficiency: ProficiencyLevel
}

export function useLanguagesManager() {
  const t = useTranslations("dashboard.settings.languageManager")
  const queryClient = useQueryClient()

  const profileQueryOptions = useMemo(
    () => orpc.students.getProfile.queryOptions(),
    [],
  )
  const { data: profileData, isLoading } = useQuery(profileQueryOptions)

  const initialLanguages = useMemo(
    () =>
      (profileData?.languages ?? []).filter(
        (
          language,
        ): language is {
          languageCode: LanguageCode
          proficiency: ProficiencyLevel
        } => isLanguageCode(language.languageCode),
      ),
    [profileData?.languages],
  )

  const [draftLanguages, setDraftLanguages] = useState<
    StudentLanguageValue[] | null
  >(null)
  const [saveError, setSaveError] = useState("")

  const languages = draftLanguages ?? initialLanguages

  const upsertMutation = useMutation({
    ...orpc.students.upsertLanguages.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: profileQueryOptions.queryKey })
      const previousData = queryClient.getQueryData(profileQueryOptions.queryKey)
      queryClient.setQueryData(profileQueryOptions.queryKey, (old) => {
        if (!old) return old
        return { ...old, languages: variables.languages }
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
      setDraftLanguages(null)
      setSaveError("")
      toast.success(t("saveSuccess"))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryOptions.queryKey })
    },
  })

  const isDirty =
    draftLanguages !== null &&
    JSON.stringify(draftLanguages) !== JSON.stringify(initialLanguages)

  function updateLanguage(index: number, patch: Partial<StudentLanguageValue>) {
    setSaveError("")
    setDraftLanguages((previous) => {
      const base = previous ?? initialLanguages
      return base.map((entry, currentIndex) =>
        currentIndex === index
          ? ({
              ...entry,
              ...patch,
            } satisfies StudentLanguageValue)
          : entry,
      )
    })
  }

  function addLanguage(language: StudentLanguageValue) {
    setSaveError("")
    setDraftLanguages((previous) => [
      ...(previous ?? initialLanguages),
      language,
    ])
  }

  function removeLanguage(index: number) {
    setSaveError("")
    setDraftLanguages((previous) => {
      const base = previous ?? initialLanguages
      return base.filter((_, currentIndex) => currentIndex !== index)
    })
  }

  async function save() {
    setSaveError("")

    if (languages.length < 1) {
      setSaveError(t("minRequired"))
      return
    }

    try {
      await upsertMutation.mutateAsync({ languages })
    } catch {
      setSaveError(t("saveError"))
      toast.error(t("saveError"))
    }
  }

  return {
    languages,
    isLoading,
    isSaving: upsertMutation.isPending,
    isDirty,
    isBusy: isLoading || upsertMutation.isPending,
    saveError,
    addLanguage,
    updateLanguage,
    removeLanguage,
    save,
  }
}
