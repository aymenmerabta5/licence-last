"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { orpcClient } from "@/server/orpc/client"

export function useUserDetailActions() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["adminUsers"] })
  }

  const revokeSession = useMutation({
    mutationFn: (sessionToken: string) =>
      orpcClient.adminUsers.revokeSession({ sessionToken }),
    onSuccess: () => {
      toast.success("Session revoked")
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const revokeAllSessions = useMutation({
    mutationFn: (userId: string) =>
      orpcClient.adminUsers.revokeAllSessions({ userId }),
    onSuccess: () => {
      toast.success("All sessions revoked")
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const banUser = useMutation({
    mutationFn: (data: { userId: string; banReason?: string; banExpiresIn?: number }) =>
      orpcClient.adminUsers.ban(data),
    onSuccess: () => {
      toast.success("User banned")
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const unbanUser = useMutation({
    mutationFn: (userId: string) =>
      orpcClient.adminUsers.unban({ userId }),
    onSuccess: () => {
      toast.success("User unbanned")
      invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  return { revokeSession, revokeAllSessions, banUser, unbanUser }
}
