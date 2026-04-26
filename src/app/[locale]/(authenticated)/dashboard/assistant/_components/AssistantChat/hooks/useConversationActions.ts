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
  model: string
  updatedAt: Date
}

interface ConversationModel {
  id: string
}

interface ConversationDetailData {
  conversation: {
    id: string
    title: string | null
    model: string
    createdAt: Date
    updatedAt: Date
    createdByUserId: string
  }
}

interface ConversationListData {
  conversations: ConversationListItem[]
}

interface UpdateConversationModelContext {
  previousConversationListData: ConversationListData | undefined
  previousConversationDetailData: ConversationDetailData | undefined
}

interface UseConversationActionsOptions {
  t: (key: string) => string
  activeConversationId: string | null
  activeConversationModel: string | null
  selectedConversationId: string | null
  conversations: ConversationListItem[]
  defaultModelId: string | null
  models: ConversationModel[]
  listConversationsQueryKey: QueryKey
  listMessagesQueryKey: QueryKey
  onSelectedConversationChange: (conversationId: string | null) => void
}

interface ResolveSelectionAfterDeleteInput {
  deletedConversationId: string
  activeConversationId: string | null
  selectedConversationId: string | null
  conversations: ConversationListItem[]
}

/**
 * Returns the next selected conversation id only when the deleted conversation
 * was currently selected/active. Returns `undefined` when selection should stay.
 */
export function resolveSelectionAfterDelete({
  deletedConversationId,
  activeConversationId,
  selectedConversationId,
  conversations,
}: ResolveSelectionAfterDeleteInput): string | null | undefined {
  const didDeleteActive = deletedConversationId === activeConversationId
  const didDeleteSelected = deletedConversationId === selectedConversationId

  if (!didDeleteActive && !didDeleteSelected) {
    return undefined
  }

  const remaining = conversations.filter(
    (conversation) => conversation.id !== deletedConversationId,
  )

  return remaining[0]?.id ?? null
}

export function applyOptimisticConversationModelUpdate<
  T extends { model: string; updatedAt: Date },
>(conversation: T, model: string, updatedAt: Date): T {
  return {
    ...conversation,
    model,
    updatedAt,
  }
}

export function shouldSkipConversationModelUpdate(
  currentModel: string | null,
  nextModel: string | null,
) {
  return !nextModel || currentModel === nextModel
}

export function useConversationActions({
  t,
  activeConversationId,
  activeConversationModel,
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
      onMutate: async (variables): Promise<UpdateConversationModelContext> => {
        const conversationDetailQueryKey =
          orpc.assistant.getConversation.queryOptions({
            input: { conversationId: variables.conversationId },
          }).queryKey

        await queryClient.cancelQueries({
          queryKey: listConversationsQueryKey,
        })
        await queryClient.cancelQueries({
          queryKey: conversationDetailQueryKey,
        })

        const previousConversationListData =
          queryClient.getQueryData<ConversationListData>(
            listConversationsQueryKey,
          )
        const previousConversationDetailData =
          queryClient.getQueryData<ConversationDetailData>(
            conversationDetailQueryKey,
          )
        const updatedAt = new Date()

        queryClient.setQueryData<ConversationListData>(
          listConversationsQueryKey,
          (current) => {
            if (!current) return current

            return {
              ...current,
              conversations: current.conversations.map((conversation) =>
                conversation.id === variables.conversationId
                  ? applyOptimisticConversationModelUpdate(
                      conversation,
                      variables.model,
                      updatedAt,
                    )
                  : conversation,
              ),
            }
          },
        )

        queryClient.setQueryData<ConversationDetailData>(
          conversationDetailQueryKey,
          (current) => {
            if (!current) return current
            if (current.conversation.id !== variables.conversationId) {
              return current
            }

            return {
              ...current,
              conversation: applyOptimisticConversationModelUpdate(
                current.conversation,
                variables.model,
                updatedAt,
              ),
            }
          },
        )

        return {
          previousConversationListData,
          previousConversationDetailData,
        }
      },
      onSuccess: async (_data, variables) => {
        await invalidateConversationList()
        await invalidateConversationDetail(variables.conversationId)
      },
      onError: (_error, variables, context) => {
        const conversationDetailQueryKey =
          orpc.assistant.getConversation.queryOptions({
            input: { conversationId: variables.conversationId },
          }).queryKey

        if (context?.previousConversationListData) {
          queryClient.setQueryData(
            listConversationsQueryKey,
            context.previousConversationListData,
          )
        } else {
          queryClient.removeQueries({
            queryKey: listConversationsQueryKey,
            exact: true,
          })
        }
        if (context?.previousConversationDetailData) {
          queryClient.setQueryData(
            conversationDetailQueryKey,
            context.previousConversationDetailData,
          )
        } else {
          queryClient.removeQueries({
            queryKey: conversationDetailQueryKey,
            exact: true,
          })
        }
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
      onSuccess: async (_data, variables) => {
        const nextSelectedConversationId = resolveSelectionAfterDelete({
          deletedConversationId: variables.conversationId,
          activeConversationId,
          selectedConversationId,
          conversations,
        })

        if (nextSelectedConversationId !== undefined) {
          onSelectedConversationChange(nextSelectedConversationId)
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
    if (
      !model ||
      !activeConversationId ||
      shouldSkipConversationModelUpdate(activeConversationModel, model)
    ) {
      return
    }

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

  const handleAppendNote = async (
    note: string,
    onSuccess?: (savedText: string) => void,
  ) => {
    if (!activeConversationId) return

    const trimmed = note.trim()
    if (!trimmed) return

    try {
      await appendMessageMutation.mutateAsync({
        conversationId: activeConversationId,
        role: "user",
        parts: [{ type: "text", text: trimmed }, { type: "note-marker" }],
      })
      toast.success(t("noteSavedSuccess"))
      onSuccess?.(trimmed)
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
