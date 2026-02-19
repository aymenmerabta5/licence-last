"use client"

import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import type { FilterState } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient/hooks/useOfferSearch"
import { orpcClient } from "@/server/orpc/client"

type AiSuggestion = FilterState & {
  keyword?: string
  explanation?: string | null
}

export function useSearchCopilot() {
  const [aiQuery, setAiQuery] = useState("")
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null)

  const {
    mutate,
    isPending,
    error: aiError,
  } = useMutation({
    mutationFn: (input: {
      query: string
      availableSkillTags: { id: string; name: string }[]
    }) => orpcClient.offers.parseSearchQuery(input),
    onSuccess: (data) => {
      setAiSuggestion({
        keyword: data.keyword,
        explanation: data.explanation,
        wilayaCode: data.wilayaCode ?? undefined,
        internshipTypes: data.internshipTypes,
        workModes: data.workModes,
        skillTagIds: data.skillTagIds,
      })
    },
  })

  const parseFilters = (
    query: string,
    availableSkillTags: { id: string; name: string; category: string | null }[],
  ) => {
    setAiSuggestion(null)
    mutate({
      query,
      availableSkillTags: availableSkillTags.map((s) => ({
        id: s.id,
        name: s.name,
      })),
    })
  }

  // Map to the same status interface the panel expects
  const aiStatus = isPending ? "streaming" : "ready"

  return {
    aiQuery,
    setAiQuery,
    aiSuggestion,
    aiStatus,
    aiError: aiError ?? undefined,
    parseFilters,
  }
}
