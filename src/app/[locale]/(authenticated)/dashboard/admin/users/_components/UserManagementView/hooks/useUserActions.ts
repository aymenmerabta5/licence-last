"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { orpcClient } from "@/server/orpc/client"

type RefreshUsersCallback = () => Promise<unknown>

export function useUserActions(refreshUsers?: RefreshUsersCallback) {
  const queryClient = useQueryClient()

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = JSON.stringify(query.queryKey)
        return queryKey.includes("adminUsers") && queryKey.includes("list")
      },
    })
  }

  const refresh = async () => {
    if (refreshUsers) {
      await refreshUsers()
      return
    }

    await invalidate()
  }

  const createUser = useMutation({
    mutationFn: (data: {
      email: string
      password: string
      name: string
      role: "student" | "company_admin" | "university_admin" | "super_admin"
    }) => orpcClient.adminUsers.create(data),
    onSuccess: async () => {
      toast.success("User created")
      await refresh()
    },
    onError: (err) => toast.error(err.message),
  })

  const setRole = useMutation({
    mutationFn: (data: {
      userId: string
      role: "student" | "company_admin" | "university_admin" | "super_admin"
    }) => orpcClient.adminUsers.setRole(data),
    onSuccess: async () => {
      toast.success("Role updated")
      await refresh()
    },
    onError: (err) => toast.error(err.message),
  })

  const updateUser = useMutation({
    mutationFn: (data: {
      userId: string
      name?: string
      email?: string
      role?: "student" | "company_admin" | "university_admin" | "super_admin"
    }) => orpcClient.adminUsers.update(data),
    onSuccess: async () => {
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
      await refresh()
    },
    onError: (err) => toast.error(err.message),
  })

  const unbanUser = useMutation({
    mutationFn: (data: { userId: string }) => orpcClient.adminUsers.unban(data),
    onSuccess: async () => {
      toast.success("User unbanned")
      await refresh()
    },
    onError: (err) => toast.error(err.message),
  })

  const removeUser = useMutation({
    mutationFn: (data: { userId: string }) =>
      orpcClient.adminUsers.remove(data),
    onSuccess: async () => {
      toast.success("User removed")
      await refresh()
    },
    onError: (err) => toast.error(err.message),
  })

  const setPassword = useMutation({
    mutationFn: (data: { userId: string; newPassword: string }) =>
      orpcClient.adminUsers.setPassword(data),
    onSuccess: async () => {
      toast.success("Password updated")
      await refresh()
    },
    onError: (err) => toast.error(err.message),
  })

  return {
    createUser,
    setRole,
    updateUser,
    banUser,
    unbanUser,
    removeUser,
    setPassword,
  }
}

export type UserActions = ReturnType<typeof useUserActions>
