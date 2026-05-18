"use client"

import { useCallback, useState } from "react"

export function useMessagesState() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [selectedStarterId, setSelectedStarterId] = useState<string | null>(
    null,
  )
  const [draft, setDraft] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const selectThread = useCallback((threadId: string | null) => {
    setSelectedThreadId(threadId)
    setSelectedStarterId(null)
  }, [])

  const selectStarter = useCallback((starterId: string | null) => {
    setSelectedStarterId(starterId)
    setSelectedThreadId(null)
  }, [])

  const resetDraft = useCallback(() => {
    setDraft("")
  }, [])

  return {
    selectedThreadId,
    selectThread,
    selectedStarterId,
    selectStarter,
    draft,
    setDraft,
    resetDraft,
    searchQuery,
    setSearchQuery,
  }
}
