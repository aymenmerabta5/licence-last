"use client"

import { useEffect } from "react"

interface UseEnsureConversationOptions {
  conversationsLoading: boolean
  modelsLoading: boolean
  activeConversationId: string | null
  isCreating: boolean
  defaultModelId: string | null
  models: Array<{ id: string }>
  onCreate: (modelId: string) => void
}

export function useEnsureConversation({
  conversationsLoading,
  modelsLoading,
  activeConversationId,
  isCreating,
  defaultModelId,
  models,
  onCreate,
}: UseEnsureConversationOptions) {
  useEffect(() => {
    if (conversationsLoading || modelsLoading) return
    if (activeConversationId || isCreating) return

    const modelId = defaultModelId ?? (models[0]?.id ?? null)
    if (!modelId) return

    onCreate(modelId)
  }, [
    conversationsLoading,
    modelsLoading,
    activeConversationId,
    isCreating,
    defaultModelId,
    models,
    onCreate,
  ])
}
