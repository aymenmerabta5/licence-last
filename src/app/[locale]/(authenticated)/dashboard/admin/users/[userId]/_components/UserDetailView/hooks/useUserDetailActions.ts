"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { orpc, orpcClient } from "@/server/orpc/client"

const ADMIN_USERS_LIST_QUERY_PATH = orpc.adminUsers.list.queryOptions({
  input: { limit: 20, offset: 0 },
}).queryKey[0]

const ADMIN_USERS_LIST_SESSIONS_QUERY_PATH =
  orpc.adminUsers.listSessions.queryOptions({
    input: { userId: "__all__" },
  }).queryKey[0]

export function useUserDetailActions() {
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
    mutationFn: (sessionToken: string) =>
      orpcClient.adminUsers.revokeSession({ sessionToken }),
    onSuccess: async () => {
      toast.success("Session revoked")
      await invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const revokeAllSessions = useMutation({
    mutationFn: (userId: string) =>
      orpcClient.adminUsers.revokeAllSessions({ userId }),
    onSuccess: async () => {
      toast.success("All sessions revoked")
      await invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const banUser = useMutation({
    mutationFn: (data: {
      userId: string
      banReason?: string
      banExpiresIn?: number
    }) => orpcClient.adminUsers.ban(data),
    onSuccess: async () => {
      toast.success("User banned")
      await invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const unbanUser = useMutation({
    mutationFn: (userId: string) => orpcClient.adminUsers.unban({ userId }),
    onSuccess: async () => {
      toast.success("User unbanned")
      await invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  return { revokeSession, revokeAllSessions, banUser, unbanUser }
}
