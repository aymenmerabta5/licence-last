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

  const getUserDetailQueryKey = (userId: string) =>
    orpc.adminUsers.list.queryOptions({
      input: {
        limit: 1,
        offset: 0,
        filterField: "id",
        filterValue: userId,
        filterOperator: "eq",
      },
    }).queryKey

  const getSessionsQueryKey = (userId: string) =>
    orpc.adminUsers.listSessions.queryOptions({
      input: { userId },
    }).queryKey

  const revokeSession = useMutation({
    mutationFn: (data: { userId: string; sessionId: string }) =>
      orpcClient.adminUsers.revokeSession(data),
    onMutate: async (variables) => {
      const sessionsQueryKey = getSessionsQueryKey(variables.userId)
      await queryClient.cancelQueries({ queryKey: sessionsQueryKey })
      const previousSessions = queryClient.getQueryData(sessionsQueryKey)

      queryClient.setQueryData(sessionsQueryKey, (old) => {
        if (!Array.isArray(old)) return old
        return old.filter(
          (s) => (s as { id: string }).id !== variables.sessionId,
        )
      })

      return { previousSessions }
    },
    onError: (err, variables, context) => {
      const sessionsQueryKey = getSessionsQueryKey(variables.userId)
      if (context?.previousSessions) {
        queryClient.setQueryData(sessionsQueryKey, context.previousSessions)
      }
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      )
    },
    onSuccess: async () => {
      toast.success(t("errors.common.sessionRevoked"))
      await invalidate()
    },
    onSettled: () => {
      invalidate()
    },
  })

  const revokeAllSessions = useMutation({
    mutationFn: (userId: string) =>
      orpcClient.adminUsers.revokeAllSessions({ userId }),
    onMutate: async (variables) => {
      const sessionsQueryKey = getSessionsQueryKey(variables)
      await queryClient.cancelQueries({ queryKey: sessionsQueryKey })
      const previousSessions = queryClient.getQueryData(sessionsQueryKey)

      queryClient.setQueryData(sessionsQueryKey, (old) => {
        if (!Array.isArray(old)) return old
        return []
      })

      return { previousSessions }
    },
    onError: (err, variables, context) => {
      const sessionsQueryKey = getSessionsQueryKey(variables)
      if (context?.previousSessions) {
        queryClient.setQueryData(sessionsQueryKey, context.previousSessions)
      }
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      )
    },
    onSuccess: async () => {
      toast.success(t("errors.common.allSessionsRevoked"))
      await invalidate()
    },
    onSettled: () => {
      invalidate()
    },
  })

  const banUser = useMutation({
    mutationFn: (data: {
      userId: string
      banReason?: string
      banExpiresIn?: number
    }) => orpcClient.adminUsers.ban(data),
    onMutate: async (variables) => {
      const userQueryKey = getUserDetailQueryKey(variables.userId)
      await queryClient.cancelQueries({ queryKey: userQueryKey })
      const previousUserData = queryClient.getQueryData(userQueryKey)

      queryClient.setQueryData(userQueryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          users: old.users.map((u) => {
            if (u.id !== variables.userId) return u
            return {
              ...u,
              banned: true,
              banReason:
                variables.banReason ??
                (u as { banReason?: string | null }).banReason ??
                null,
            }
          }) as typeof old.users,
        }
      })

      return { previousUserData }
    },
    onError: (err, variables, context) => {
      const userQueryKey = getUserDetailQueryKey(variables.userId)
      if (context?.previousUserData) {
        queryClient.setQueryData(userQueryKey, context.previousUserData)
      }
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      )
    },
    onSuccess: async () => {
      toast.success(t("errors.common.userBanned"))
      await invalidate()
    },
    onSettled: () => {
      invalidate()
    },
  })

  const unbanUser = useMutation({
    mutationFn: (userId: string) => orpcClient.adminUsers.unban({ userId }),
    onMutate: async (variables) => {
      const userQueryKey = getUserDetailQueryKey(variables)
      await queryClient.cancelQueries({ queryKey: userQueryKey })
      const previousUserData = queryClient.getQueryData(userQueryKey)

      queryClient.setQueryData(userQueryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          users: old.users.map((u) => {
            if (u.id !== variables) return u
            return {
              ...u,
              banned: false,
              banReason: null,
              banExpires: null,
            }
          }) as typeof old.users,
        }
      })

      return { previousUserData }
    },
    onError: (err, variables, context) => {
      const userQueryKey = getUserDetailQueryKey(variables)
      if (context?.previousUserData) {
        queryClient.setQueryData(userQueryKey, context.previousUserData)
      }
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      )
    },
    onSuccess: async () => {
      toast.success(t("errors.common.userUnbanned"))
      await invalidate()
    },
    onSettled: () => {
      invalidate()
    },
  })

  return { revokeSession, revokeAllSessions, banUser, unbanUser }
}
