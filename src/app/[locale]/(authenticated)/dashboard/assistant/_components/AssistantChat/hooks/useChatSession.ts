"use client"

import { useEffect, useMemo, useState } from "react"
import type { UIMessage } from "ai"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { orpc } from "@/server/orpc/client"

function isMessageRole(value: unknown): value is "system" | "user" | "assistant" {
  return value === "system" || value === "user" || value === "assistant"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

type UIMessagePart = UIMessage["parts"][number]

function isUIMessagePart(value: unknown): value is UIMessagePart {
  return isRecord(value) && typeof value.type === "string"
}

function coerceParts(value: unknown): UIMessage["parts"] {
  if (!Array.isArray(value)) return []
  return value.filter(isUIMessagePart)
}

function toChatMessages(
  rows: Array<{ id: string; role: unknown; parts: unknown }>,
): UIMessage[] {
  return rows
    .filter(
      (r): r is { id: string; role: "system" | "user" | "assistant"; parts: unknown } =>
        isMessageRole(r.role),
    )
    .map((r) => ({
      id: r.id,
      role: r.role,
      parts: coerceParts(r.parts),
    }))
}

export function useChatSession() {
  const queryClient = useQueryClient()

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  const listModelsQuery = useMemo(() => orpc.assistant.listModels.queryOptions(), [])
  const { data: modelsData, isLoading: modelsLoading } = useQuery(listModelsQuery)

  const models = useMemo(() => modelsData?.models ?? [], [modelsData])
  const defaultModelId = modelsData?.defaultModelId ?? null

  const listConversationsQuery = useMemo(
    () => orpc.assistant.listConversations.queryOptions({ input: { limit: 100 } }),
    [],
  )
  const { data: conversationsData, isLoading: conversationsLoading } =
    useQuery(listConversationsQuery)

  const conversations = useMemo(
    () => conversationsData?.conversations ?? [],
    [conversationsData],
  )

  const activeConversationId = selectedConversationId ?? conversations[0]?.id ?? null
  const selectedConversation =
    (activeConversationId
      ? conversations.find((c) => c.id === activeConversationId)
      : null) ?? null

  const createConversationMutation = useMutation(
    orpc.assistant.createConversation.mutationOptions({
      onSuccess: async (conv) => {
        setSelectedConversationId(conv.id)
        await queryClient.invalidateQueries({
          queryKey: listConversationsQuery.queryKey,
        })
      },
    }),
  )

  const updateModelMutation = useMutation(
    orpc.assistant.updateConversationModel.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: listConversationsQuery.queryKey,
        })
      },
    }),
  )

  const deleteConversationMutation = useMutation(
    orpc.assistant.deleteConversation.mutationOptions({
      onSuccess: async () => {
        if (selectedConversationId === activeConversationId) {
          const remaining = conversations.filter(
            (c) => c.id !== activeConversationId,
          )
          setSelectedConversationId(remaining[0]?.id ?? null)
        }
        await queryClient.invalidateQueries({
          queryKey: listConversationsQuery.queryKey,
        })
      },
    }),
  )

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    ...orpc.assistant.listMessages.queryOptions({
      input: { conversationId: activeConversationId ?? "__disabled__" },
    }),
    enabled: Boolean(activeConversationId),
  })

  const persistedMessages = useMemo(
    () => messagesData?.messages ?? [],
    [messagesData],
  )
  const initialMessages = useMemo(
    () => toChatMessages(persistedMessages),
    [persistedMessages],
  )
  const messageCreatedAtById = useMemo<
    Record<string, string | Date | undefined>
  >(() => {
    const map: Record<string, string | Date | undefined> = {}
    for (const message of persistedMessages) {
      map[message.id] = message.createdAt
    }
    return map
  }, [persistedMessages])

  // Auto-create first conversation
  useEffect(() => {
    if (conversationsLoading || modelsLoading) return
    if (activeConversationId) return
    if (createConversationMutation.isPending) return
    const modelId = defaultModelId ?? (models[0]?.id ?? null)
    if (!modelId) return
    createConversationMutation.mutate({ model: modelId })
  }, [
    conversationsLoading,
    modelsLoading,
    activeConversationId,
    createConversationMutation,
    defaultModelId,
    models,
  ])

  const activeModel = selectedConversation?.model ?? defaultModelId

  const handleCreateConversation = () => {
    const modelId = defaultModelId ?? (models[0]?.id ?? null)
    if (!modelId) return
    createConversationMutation.mutate({ model: modelId })
  }

  const handleDeleteConversation = async (conversationId: string) => {
    await deleteConversationMutation.mutateAsync({ conversationId })
  }

  const handleUpdateModel = (model: string | null) => {
    if (!activeConversationId || !model) return
    updateModelMutation.mutate({
      conversationId: activeConversationId,
      model,
    })
  }

  return {
    conversations,
    conversationsLoading,
    activeConversationId,
    selectedConversation,
    models,
    activeModel,
    messagesLoading,
    initialMessages,
    messageCreatedAtById,
    handleSelectConversation: setSelectedConversationId,
    handleCreateConversation,
    handleDeleteConversation,
    handleUpdateModel,
  }
}
