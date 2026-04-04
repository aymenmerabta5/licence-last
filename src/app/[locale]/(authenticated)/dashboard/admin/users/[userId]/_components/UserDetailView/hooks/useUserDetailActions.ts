"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { resolveLocalizedError } from "@/lib/error-message"
import { orpc, orpcClient } from "@/server/orpc/client"

const ADMIN_USERS_LIST_QUERY_PATH = orpc.adminUsers.list.queryOptions({
  input: { limit: 20, offset: 0 },
}).queryKey[0]

const ADMIN_USERS_LIST_SESSIONS_QUERY_PATH =
  orpc.adminUsers.listSessions.queryOptions({
    input: { userId: "__all__" },
  }).queryKey[0]

export function useUserDetailActions() {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [ADMIN_USERS_LIST_QUERY_PATH],
      }),
      queryClient.invalidateQueries({
        queryKey: [ADMIN_USERS_LIST_SESSIONS_QUERY_PATH],
      }),
    ])
  }

  const revokeSession = useMutation({
    mutationFn: (data: { userId: string; sessionId: string }) =>
      orpcClient.adminUsers.revokeSession(data),
    onSuccess: async () => {
      toast.success(t("errors.common.sessionRevoked"))
      await invalidate()
    },
    onError: (err) =>
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      ),
  })

  const revokeAllSessions = useMutation({
    mutationFn: (userId: string) =>
      orpcClient.adminUsers.revokeAllSessions({ userId }),
    onSuccess: async () => {
      toast.success(t("errors.common.allSessionsRevoked"))
      await invalidate()
    },
    onError: (err) =>
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      ),
  })

  const banUser = useMutation({
    mutationFn: (data: {
      userId: string
      banReason?: string
      banExpiresIn?: number
    }) => orpcClient.adminUsers.ban(data),
    onSuccess: async () => {
      toast.success(t("errors.common.userBanned"))
      await invalidate()
    },
    onError: (err) =>
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      ),
  })

  const unbanUser = useMutation({
    mutationFn: (userId: string) => orpcClient.adminUsers.unban({ userId }),
    onSuccess: async () => {
      toast.success(t("errors.common.userUnbanned"))
      await invalidate()
    },
    onError: (err) =>
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      ),
  })

  return { revokeSession, revokeAllSessions, banUser, unbanUser }
}
