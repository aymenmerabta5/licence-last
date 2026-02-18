"use client"

import { useCallback, useState } from "react"

export function useMessagesState() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")

  const selectThread = useCallback((threadId: string | null) => {
    setSelectedThreadId(threadId)
  }, [])

  const resetDraft = useCallback(() => {
    setDraft("")
  }, [])

  return {
    selectedThreadId,
    selectThread,
    draft,
    setDraft,
    resetDraft,
  }
}
