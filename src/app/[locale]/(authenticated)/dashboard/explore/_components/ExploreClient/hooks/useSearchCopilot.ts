"use client"

import { useState } from "react"

import { getNumber, getString, getStringArray } from "@/lib/ai/tool-output"
import { useCopilot } from "@/hooks"

import type { FilterState } from "./useOfferSearch"

type AiSuggestion = FilterState & {
  keyword?: string
  explanation?: string | null
}

export function useSearchCopilot() {
  const [aiQuery, setAiQuery] = useState("")
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null)

  const { sendMessage, status: aiStatus, error: aiError, reset } = useCopilot({
    toolName: "student_search_parse",
    onResult: (out) => {
      setAiSuggestion({
        keyword: getString(out.keyword) ?? undefined,
        explanation: getString(out.explanation),
        wilayaCode: getNumber(out.wilayaCode) ?? undefined,
        internshipTypes: getStringArray(out.internshipTypes),
        workModes: getStringArray(out.workModes),
        skillTagIds: getStringArray(out.skillTagIds),
      })
    },
  })

  const parseFilters = (
    query: string,
    availableSkillTags: { id: string; name: string; category: string | null }[],
  ) => {
    setAiSuggestion(null)
    const context = {
      intent: "student_search_parse",
      query,
      availableSkillTags,
    }
    void sendMessage({ text: query }, { body: { context } })
  }

  return {
    aiQuery,
    setAiQuery,
    aiSuggestion,
    aiStatus,
    aiError,
    parseFilters,
    reset,
  }
}
