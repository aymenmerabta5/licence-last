"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useRef } from "react"
import type {
  MessagesRole,
  MessageThread,
  ThreadMessagesResponse,
} from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/types"
import { orpcClient } from "@/server/orpc/client"

interface UseMessagesDataParams {
  role: MessagesRole
  selectedThreadId: string | null
}

interface SendMessageParams {
  thread: MessageThread
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

export function useMessagesData({
  role,
  selectedThreadId,
}: UseMessagesDataParams) {
  const queryClient = useQueryClient()
  const markedThreadIdRef = useRef<string | null>(null)

  const threadsQuery = useQuery({
    queryKey: ["messages", "threads", role],
    queryFn: () => fetchThreads(role),
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
    mutationFn: async ({ thread, body }: SendMessageParams) => {
      const normalizedBody = body.trim()
      if (!normalizedBody) {
        throw new Error("Message cannot be empty.")
      }

      if (role === "student") {
        return orpcClient.messages.sendByStudent({
          offerId: thread.offerId,
          body: normalizedBody,
        })
      }

      if (!thread.studentUserId) {
        throw new Error("Missing student identifier for this thread.")
      }

      return orpcClient.messages.sendByCompany({
        offerId: thread.offerId,
        studentUserId: thread.studentUserId,
        body: normalizedBody,
      })
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["messages", "threads", role],
        }),
        queryClient.invalidateQueries({
          queryKey: ["messages", "thread", variables.thread.id],
        }),
      ])
    },
  })

  const markThreadReadMutation = useMutation({
    mutationFn: async (threadId: string) =>
      orpcClient.messages.markThreadRead({ threadId }),
    onSuccess: async () => {
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

  return {
    threads,
    threadsLoading: threadsQuery.isLoading,
    threadsErrorMessage: threadsQuery.error
      ? toErrorMessage(threadsQuery.error, "Failed to load message threads.")
      : null,
    threadMessages: threadMessagesQuery.data?.messages ?? [],
    threadMessagesLoading: threadMessagesQuery.isLoading,
    threadMessagesErrorMessage: threadMessagesQuery.error
      ? toErrorMessage(
          threadMessagesQuery.error,
          "Failed to load conversation.",
        )
      : null,
    sendMessage: sendMessageMutation.mutateAsync,
    sendPending: sendMessageMutation.isPending,
    sendErrorMessage: sendMessageMutation.error
      ? toErrorMessage(sendMessageMutation.error, "Failed to send message.")
      : null,
  }
}
