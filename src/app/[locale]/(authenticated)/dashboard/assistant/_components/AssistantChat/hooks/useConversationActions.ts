"use client"

import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { orpc } from "@/server/orpc/client"

interface ConversationListItem {
  id: string
}

interface ConversationModel {
  id: string
}

interface UseConversationActionsOptions {
  t: (key: string) => string
  activeConversationId: string | null
  selectedConversationId: string | null
  conversations: ConversationListItem[]
  defaultModelId: string | null
  models: ConversationModel[]
  listConversationsQueryKey: QueryKey
  listMessagesQueryKey: QueryKey
  onSelectedConversationChange: (conversationId: string | null) => void
}

export function useConversationActions({
  t,
  activeConversationId,
  selectedConversationId,
  conversations,
  defaultModelId,
  models,
  listConversationsQueryKey,
  listMessagesQueryKey,
  onSelectedConversationChange,
}: UseConversationActionsOptions) {
  const queryClient = useQueryClient()

  const invalidateConversationList = async () => {
    await queryClient.invalidateQueries({
      queryKey: listConversationsQueryKey,
    })
  }

  const invalidateConversationDetail = async (conversationId: string) => {
    await queryClient.invalidateQueries({
      queryKey: orpc.assistant.getConversation.queryOptions({
        input: { conversationId },
      }).queryKey,
      refetchType: "active",
    })
  }

  const createConversationMutation = useMutation(
    orpc.assistant.createConversation.mutationOptions({
      onSuccess: async (conversation) => {
        onSelectedConversationChange(conversation.id)
        await invalidateConversationList()
      },
    }),
  )

  const updateModelMutation = useMutation(
    orpc.assistant.updateConversationModel.mutationOptions({
      onSuccess: async (_data, variables) => {
        await invalidateConversationList()
        await invalidateConversationDetail(variables.conversationId)
        toast.success(t("modelUpdateSuccess"))
      },
      onError: () => {
        toast.error(t("modelUpdateError"))
      },
    }),
  )

  const updateTitleMutation = useMutation(
    orpc.assistant.updateConversationTitle.mutationOptions({
      onSuccess: async (_data, variables) => {
        await invalidateConversationList()
        await invalidateConversationDetail(variables.conversationId)

        toast.success(t("titleUpdateSuccess"))
      },
      onError: () => {
        toast.error(t("titleUpdateError"))
      },
    }),
  )

  const deleteConversationMutation = useMutation(
    orpc.assistant.deleteConversation.mutationOptions({
      onSuccess: async () => {
        if (selectedConversationId === activeConversationId) {
          const remaining = conversations.filter(
            (conversation) => conversation.id !== activeConversationId,
          )
          onSelectedConversationChange(remaining[0]?.id ?? null)
        }

        await invalidateConversationList()
        toast.success(t("deleteConversationSuccess"))
      },
      onError: () => {
        toast.error(t("deleteConversationError"))
      },
    }),
  )

  const appendMessageMutation = useMutation(
    orpc.assistant.appendMessage.mutationOptions({
      onSuccess: async () => {
        await invalidateConversationList()
        await queryClient.invalidateQueries({
          queryKey: listMessagesQueryKey,
        })
      },
    }),
  )

  const handleCreateConversation = async () => {
    const modelId = defaultModelId ?? models[0]?.id ?? null
    if (!modelId) return

    try {
      await createConversationMutation.mutateAsync({ model: modelId })
      toast.success(t("createConversationSuccess"))
    } catch {
      toast.error(t("createConversationError"))
    }
  }

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversationMutation.mutateAsync({ conversationId })
    } catch {
      // onError callback handles toast feedback.
    }
  }

  const handleUpdateModel = (model: string | null) => {
    if (!activeConversationId || !model) return
    updateModelMutation.mutate({
      conversationId: activeConversationId,
      model,
    })
  }

  const handleUpdateTitle = (title: string | null) => {
    if (!activeConversationId) return
    updateTitleMutation.mutate({
      conversationId: activeConversationId,
      title,
    })
  }

  const handleAppendNote = async (note: string) => {
    if (!activeConversationId) return

    const trimmed = note.trim()
    if (!trimmed) return

    try {
      await appendMessageMutation.mutateAsync({
        conversationId: activeConversationId,
        role: "user",
        parts: [{ type: "text", text: trimmed }],
      })
      toast.success(t("noteSavedSuccess"))
    } catch {
      toast.error(t("noteSavedError"))
    }
  }

  return {
    createConversationMutation,
    handleCreateConversation,
    handleDeleteConversation,
    handleUpdateModel,
    handleUpdateTitle,
    handleAppendNote,
  }
}
