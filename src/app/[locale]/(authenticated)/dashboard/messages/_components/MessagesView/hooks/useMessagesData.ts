"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useRef } from "react"
import type {
  MessageConversationStarter,
  MessagesRole,
  MessageThread,
  ThreadMessagesResponse,
} from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/types"
import { orpcClient } from "@/server/orpc/client"

interface UseMessagesDataParams {
  role: MessagesRole
  selectedThreadId: string | null
  currentUserId: string
}

type SendMessageTarget =
  | {
      kind: "thread"
      thread: MessageThread
    }
  | {
      kind: "starter"
      starter: MessageConversationStarter
    }

interface SendMessageParams {
  target: SendMessageTarget
  body: string
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim().length > 0) {
      return message
    }
  }

  return fallback
}

async function fetchThreads(role: MessagesRole): Promise<MessageThread[]> {
  if (role === "student") {
    return (await orpcClient.messages.listByStudent({
      limit: 50,
    })) as MessageThread[]
  }

  return (await orpcClient.messages.listByCompany({
    limit: 50,
  })) as MessageThread[]
}

async function fetchThreadMessages(
  threadId: string,
): Promise<ThreadMessagesResponse> {
  return (await orpcClient.messages.listThreadMessages({
    threadId,
  })) as ThreadMessagesResponse
}

async function fetchConversationStarters(
  role: MessagesRole,
): Promise<MessageConversationStarter[]> {
  if (role === "student") {
    return (await orpcClient.messages.listStartersByStudent({
      limit: 12,
    })) as MessageConversationStarter[]
  }

  return (await orpcClient.messages.listStartersByCompany({
    limit: 24,
  })) as MessageConversationStarter[]
}

export function useMessagesData({
  role,
  selectedThreadId,
  currentUserId,
}: UseMessagesDataParams) {
  const t = useTranslations("dashboard.messages")
  const queryClient = useQueryClient()
  const markedThreadIdRef = useRef<string | null>(null)

  const threadsQuery = useQuery({
    queryKey: ["messages", "threads", role],
    queryFn: () => fetchThreads(role),
  })

  const startersQuery = useQuery({
    queryKey: ["messages", "starters", role],
    queryFn: () => fetchConversationStarters(role),
  })

  const threadMessagesQuery = useQuery({
    queryKey: ["messages", "thread", selectedThreadId],
    enabled: Boolean(selectedThreadId),
    queryFn: () => {
      if (!selectedThreadId) {
        throw new Error("Thread id is required to load messages.")
      }

      return fetchThreadMessages(selectedThreadId)
    },
  })

  const sendMessageMutation = useMutation({
    mutationFn: async ({ target, body }: SendMessageParams) => {
      const normalizedBody = body.trim()
      if (!normalizedBody) {
        throw new Error(t("messageEmptyError"))
      }

      const offerId =
        target.kind === "thread"
          ? target.thread.offerId
          : target.starter.offerId

      if (role === "student") {
        return orpcClient.messages.sendByStudent({
          offerId,
          body: normalizedBody,
        })
      }

      const studentUserId =
        target.kind === "thread"
          ? target.thread.studentUserId
          : target.starter.studentUserId

      if (!studentUserId) {
        throw new Error(t("missingStudentError"))
      }

      return orpcClient.messages.sendByCompany({
        offerId,
        studentUserId,
        body: normalizedBody,
      })
    },
    onMutate: async ({ target, body }) => {
      const normalizedBody = body.trim()
      if (!normalizedBody) return

      if (target.kind === "thread") {
        const threadId = target.thread.id
        const threadMessagesKey = ["messages", "thread", threadId]
        const threadsKey = ["messages", "threads", role]

        await queryClient.cancelQueries({ queryKey: threadMessagesKey })
        await queryClient.cancelQueries({ queryKey: threadsKey })

        const previousThreadMessages =
          queryClient.getQueryData<ThreadMessagesResponse>(threadMessagesKey)
        const previousThreads =
          queryClient.getQueryData<MessageThread[]>(threadsKey)

        queryClient.setQueryData<ThreadMessagesResponse>(
          threadMessagesKey,
          (old) => {
            if (!old) return old
            return {
              ...old,
              messages: [
                ...old.messages,
                {
                  id: `optimistic-${Date.now()}`,
                  senderUserId: currentUserId,
                  body: normalizedBody,
                  createdAt: new Date(),
                  senderName: null,
                  senderImage: null,
                },
              ],
            }
          },
        )

        queryClient.setQueryData<MessageThread[]>(threadsKey, (old) => {
          if (!old) return old
          return old.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  lastMessageAt: new Date(),
                  hasUnread: false,
                  unreadCount: 0,
                }
              : thread,
          )
        })

        return { previousThreadMessages, previousThreads, threadId }
      }

      const starterId = target.starter.id
      const startersKey = ["messages", "starters", role]

      await queryClient.cancelQueries({ queryKey: startersKey })
      const previousStarters =
        queryClient.getQueryData<MessageConversationStarter[]>(startersKey)

      queryClient.setQueryData<MessageConversationStarter[]>(
        startersKey,
        (old) => {
          if (!old) return old
          return old.filter((starter) => starter.id !== starterId)
        },
      )

      return { previousStarters }
    },
    onError: (_error, _variables, context) => {
      if (context?.threadId && context?.previousThreadMessages) {
        queryClient.setQueryData(
          ["messages", "thread", context.threadId],
          context.previousThreadMessages,
        )
      }
      if (context?.previousThreads) {
        queryClient.setQueryData(
          ["messages", "threads", role],
          context.previousThreads,
        )
      }
      if (context?.previousStarters) {
        queryClient.setQueryData(
          ["messages", "starters", role],
          context.previousStarters,
        )
      }
    },
    onSuccess: async (_, variables) => {
      const threadId =
        variables.target.kind === "thread"
          ? variables.target.thread.id
          : undefined

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["messages", "threads", role],
        }),
        queryClient.invalidateQueries({
          queryKey: ["messages", "starters", role],
        }),
        ...(threadId
          ? [
              queryClient.invalidateQueries({
                queryKey: ["messages", "thread", threadId],
              }),
            ]
          : []),
      ])
    },
    onSettled: async (_, __, variables) => {
      const threadId =
        variables.target.kind === "thread"
          ? variables.target.thread.id
          : undefined

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["messages", "threads", role],
        }),
        queryClient.invalidateQueries({
          queryKey: ["messages", "starters", role],
        }),
        ...(threadId
          ? [
              queryClient.invalidateQueries({
                queryKey: ["messages", "thread", threadId],
              }),
            ]
          : []),
      ])
    },
  })

  const markThreadReadMutation = useMutation({
    mutationFn: async (threadId: string) =>
      orpcClient.messages.markThreadRead({ threadId }),
    onMutate: async (threadId: string) => {
      const threadsKey = ["messages", "threads", role]
      await queryClient.cancelQueries({ queryKey: threadsKey })
      const previousThreads =
        queryClient.getQueryData<MessageThread[]>(threadsKey)

      queryClient.setQueryData<MessageThread[]>(threadsKey, (old) => {
        if (!old) return old
        return old.map((thread) =>
          thread.id === threadId
            ? { ...thread, hasUnread: false, unreadCount: 0 }
            : thread,
        )
      })

      return { previousThreads }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousThreads) {
        queryClient.setQueryData(
          ["messages", "threads", role],
          context.previousThreads,
        )
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["messages", "threads", role],
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["messages", "threads", role],
      })
    },
  })
  const markThreadRead = markThreadReadMutation.mutate

  useEffect(() => {
    markedThreadIdRef.current = null
  }, [])

  useEffect(() => {
    if (!selectedThreadId || !threadMessagesQuery.isSuccess) {
      return
    }

    if (markedThreadIdRef.current === selectedThreadId) {
      return
    }

    markedThreadIdRef.current = selectedThreadId
    markThreadRead(selectedThreadId)
  }, [selectedThreadId, threadMessagesQuery.isSuccess, markThreadRead])

  const threads = useMemo(() => threadsQuery.data ?? [], [threadsQuery.data])
  const starters = useMemo(() => startersQuery.data ?? [], [startersQuery.data])

  return {
    threads,
    starters,
    threadsLoading: threadsQuery.isLoading,
    threadsErrorMessage: threadsQuery.error
      ? toErrorMessage(threadsQuery.error, t("threadsLoadError"))
      : null,
    startersLoading: startersQuery.isLoading,
    startersErrorMessage: startersQuery.error
      ? toErrorMessage(startersQuery.error, t("starterLoadError"))
      : null,
    threadMessages: threadMessagesQuery.data?.messages ?? [],
    threadMessagesLoading: threadMessagesQuery.isLoading,
    threadMessagesErrorMessage: threadMessagesQuery.error
      ? toErrorMessage(threadMessagesQuery.error, t("conversationLoadError"))
      : null,
    sendMessage: sendMessageMutation.mutateAsync,
    sendPending: sendMessageMutation.isPending,
    sendErrorMessage: sendMessageMutation.error
      ? toErrorMessage(sendMessageMutation.error, t("sendError"))
      : null,
  }
}
