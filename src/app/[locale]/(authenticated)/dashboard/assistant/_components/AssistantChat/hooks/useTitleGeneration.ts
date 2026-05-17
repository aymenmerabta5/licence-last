"use client"

import { useCallback, useEffect, useState } from "react"
import type { ConversationListItem } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/types"

interface UseTitleGenerationOptions {
  conversations: ConversationListItem[]
  activeConversationId: string | null
}

interface UseTitleGenerationResult {
  generatingTitleIds: Set<string>
  isGeneratingTitle: boolean
  handleFirstMessageSent: (conversationId: string) => void
}

export function useTitleGeneration({
  conversations,
  activeConversationId,
}: UseTitleGenerationOptions): UseTitleGenerationResult {
  const [pendingTitleIds, setPendingTitleIds] = useState<Set<string>>(new Set())

  // Clear pending IDs when titles appear in fetched data
  useEffect(() => {
    setPendingTitleIds((prev) => {
      if (prev.size === 0) return prev
      const next = new Set(prev)
      for (const id of next) {
        const conv = conversations.find((c) => c.id === id)
        if (conv?.title) {
          next.delete(id)
        }
      }
      return next
    })
  }, [conversations])

  // Safety timeout: clear all pending IDs after 15 seconds
  useEffect(() => {
    if (pendingTitleIds.size === 0) return
    const timer = setTimeout(() => {
      setPendingTitleIds(new Set())
    }, 15000)
    return () => clearTimeout(timer)
  }, [pendingTitleIds])

  const handleFirstMessageSent = useCallback(
    (conversationId: string) => {
      const conv = conversations.find((c) => c.id === conversationId)
      if (conv && !conv.title) {
        setPendingTitleIds((prev) => new Set(prev).add(conversationId))
      }
    },
    [conversations],
  )

  const isGeneratingTitle = activeConversationId
    ? pendingTitleIds.has(activeConversationId)
    : false

  return {
    generatingTitleIds: pendingTitleIds,
    isGeneratingTitle,
    handleFirstMessageSent,
  }
}
