"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { orpcClient } from "@/server/orpc/client"
import { useInfiniteScroll } from "@/hooks"

export function useNotifications() {
  const queryClient = useQueryClient()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["notifications", "list"],
    queryFn: async ({ pageParam }) =>
      orpcClient.notifications.list({
        cursor: pageParam as { createdAt: string; id: string } | undefined,
        limit: 20,
      }),
    initialPageParam: undefined as { createdAt: string; id: string } | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const notifications = useMemo(
    () => data?.pages.flatMap((p) => p.notifications) ?? [],
    [data],
  )
  const unreadCount = data?.pages[0]?.unreadCount ?? 0

  const markAllReadMutation = useMutation({
    mutationFn: async () => orpcClient.notifications.markAllRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications", "list"] })
    },
  })

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage)

  return {
    notifications,
    unreadCount,
    isLoading,
    isFetchingNextPage,
    sentinelRef,
    markAllRead: markAllReadMutation.mutate,
    isMarkingRead: markAllReadMutation.isPending,
  }
}
