"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { resolveLocalizedError } from "@/lib/error-message"
import { orpcClient } from "@/server/orpc/client"

type RefreshUsersCallback = () => Promise<unknown>

export function useUserActions(refreshUsers?: RefreshUsersCallback) {
  const t = useTranslations()
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
      toast.success(t("errors.common.userCreated"))
      await refresh()
    },
    onError: (err) =>
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      ),
  })

  const setRole = useMutation({
    mutationFn: (data: {
      userId: string
      role: "student" | "company_admin" | "university_admin" | "super_admin"
    }) => orpcClient.adminUsers.setRole(data),
    onSuccess: async () => {
      toast.success(t("errors.common.roleUpdated"))
      await refresh()
    },
    onError: (err) =>
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      ),
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
      await refresh()
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
    mutationFn: (data: { userId: string }) => orpcClient.adminUsers.unban(data),
    onSuccess: async () => {
      toast.success(t("errors.common.userUnbanned"))
      await refresh()
    },
    onError: (err) =>
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      ),
  })

  const removeUser = useMutation({
    mutationFn: (data: { userId: string }) =>
      orpcClient.adminUsers.remove(data),
    onSuccess: async () => {
      toast.success(t("errors.common.userRemoved"))
      await refresh()
    },
    onError: (err) =>
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      ),
  })

  const setPassword = useMutation({
    mutationFn: (data: { userId: string; newPassword: string }) =>
      orpcClient.adminUsers.setPassword(data),
    onSuccess: async () => {
      toast.success(t("errors.common.passwordUpdated"))
      await refresh()
    },
    onError: (err) =>
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      ),
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
