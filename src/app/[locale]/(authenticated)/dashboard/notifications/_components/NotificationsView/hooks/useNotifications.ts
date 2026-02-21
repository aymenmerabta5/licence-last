"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useRef } from "react"
import { toast } from "sonner"
import { notificationsQueryKeys } from "@/lib/notifications-query"
import { orpc, orpcClient } from "@/server/orpc/client"

export function useNotifications(viewerId: string) {
  const t = useTranslations("dashboard.notifications")
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    {
      queryKey: notificationsQueryKeys.list(viewerId, 50),
      queryFn: () => orpcClient.notifications.list({ limit: 50 }),
    },
  )
  const notifications = data?.notifications ?? []
  const unreadCount = data?.unreadCount ?? 0

  const markAllReadMutation = useMutation({
    ...orpc.notifications.markAllRead.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: notificationsQueryKeys.root(viewerId),
        })
        toast.success(t("markAllReadSuccess"))
      },
      onError: () => {
        toast.error(t("markAllReadError"))
      },
    }),
  })

  const markReadMutation = useMutation(
    orpc.notifications.markRead.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: notificationsQueryKeys.root(viewerId),
        })
      },
    }),
  )

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  return {
    notifications,
    unreadCount,
    isLoading,
    isFetchingNextPage: false,
    sentinelRef,
    markRead: (notificationId: string) =>
      markReadMutation.mutate({ notificationId }),
    markAllRead: () => markAllReadMutation.mutate({}),
    isMarkingRead: markAllReadMutation.isPending,
  }
}
