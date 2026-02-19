"use client"

import { useCallback, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { orpc } from "@/server/orpc/client"

import {
  toChatMessages,
  toMessageCreatedAtById,
} from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/hooks/chatMessageAdapters"
import { useConversationActions } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/hooks/useConversationActions"
import { useEnsureConversation } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/hooks/useEnsureConversation"

export function useChatSession() {
  const t = useTranslations("dashboard.assistant")
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

  const conversationQuery = useQuery({
    ...orpc.assistant.getConversation.queryOptions({
      input: { conversationId: activeConversationId ?? "__disabled__" },
    }),
    enabled: Boolean(activeConversationId),
  })

  const selectedConversation = useMemo(() => {
    const fallback = activeConversationId
      ? conversations.find((conversation) => conversation.id === activeConversationId)
      : null
    return conversationQuery.data?.conversation ?? fallback ?? null
  }, [activeConversationId, conversationQuery.data?.conversation, conversations])

  const listMessagesQuery = useMemo(
    () =>
      orpc.assistant.listMessages.queryOptions({
        input: { conversationId: activeConversationId ?? "__disabled__" },
      }),
    [activeConversationId],
  )

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    ...listMessagesQuery,
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
  >(() => toMessageCreatedAtById(persistedMessages), [persistedMessages])

  const {
    createConversationMutation,
    handleCreateConversation,
    handleDeleteConversation,
    handleUpdateModel,
    handleUpdateTitle,
    handleAppendNote,
  } = useConversationActions({
    t,
    activeConversationId,
    selectedConversationId,
    conversations,
    defaultModelId,
    models,
    listConversationsQueryKey: listConversationsQuery.queryKey,
    listMessagesQueryKey: listMessagesQuery.queryKey,
    onSelectedConversationChange: setSelectedConversationId,
  })

  const createConversationWithModel = useCallback(
    (modelId: string) => {
      createConversationMutation.mutate({ model: modelId })
    },
    [createConversationMutation],
  )

  useEnsureConversation({
    conversationsLoading,
    modelsLoading,
    activeConversationId,
    isCreating: createConversationMutation.isPending,
    defaultModelId,
    models,
    onCreate: createConversationWithModel,
  })

  const activeModel = selectedConversation?.model ?? defaultModelId

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
    handleUpdateTitle,
    handleAppendNote,
  }
}
