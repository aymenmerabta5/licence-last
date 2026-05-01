"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { resolveLocalizedError } from "@/lib/error-message"
import { orpcClient } from "@/server/orpc/client"
import type { AdminUser } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/types"

type RefreshUsersCallback = () => Promise<unknown>

type UsersListData = {
  users: AdminUser[]
  total: number
  limit: number
  offset: number
}

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

  const cancelAdminUsersQueries = async () => {
    await queryClient.cancelQueries({
      predicate: (query) => {
        const queryKey = JSON.stringify(query.queryKey)
        return queryKey.includes("adminUsers") && queryKey.includes("list")
      },
    })
  }

  const getAdminUsersListQueries = () =>
    queryClient.getQueriesData<UsersListData>({
      predicate: (query) => {
        const queryKey = JSON.stringify(query.queryKey)
        return queryKey.includes("adminUsers") && queryKey.includes("list")
      },
    })

  const createUser = useMutation({
    mutationFn: (data: {
      email: string
      password: string
      name: string
      role:
        | "student"
        | "company_admin"
        | "university_admin"
        | "department_head"
        | "super_admin"
        | "recruiter"
      universityId?: string
      companyId?: string
    }) => orpcClient.adminUsers.create(data),
    onMutate: async (data) => {
      await cancelAdminUsersQueries()
      const previousQueries = getAdminUsersListQueries()
      const optimisticUser: AdminUser = {
        id: `optimistic-${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        banned: false,
        banReason: null,
        banExpires: null,
        createdAt: new Date().toISOString(),
        image: null,
      }
      previousQueries.forEach(([queryKey, queryData]) => {
        if (!queryData) return
        queryClient.setQueryData<UsersListData>(queryKey, (old) => {
          if (!old) return old
          return {
            ...old,
            users: [optimisticUser, ...old.users],
            total: old.total + 1,
          }
        })
      })
      return { previousQueries }
    },
    onSuccess: async () => {
      toast.success(t("errors.common.userCreated"))
      await refresh()
    },
    onError: (err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = JSON.stringify(query.queryKey)
          return queryKey.includes("adminUsers") && queryKey.includes("list")
        },
      })
    },
  })

  const setRole = useMutation({
    mutationFn: (data: {
      userId: string
      role:
        | "student"
        | "company_admin"
        | "university_admin"
        | "department_head"
        | "super_admin"
        | "recruiter"
      universityId?: string
      companyId?: string
      departmentId?: string
    }) => orpcClient.adminUsers.setRole(data),
    onMutate: async (data) => {
      await cancelAdminUsersQueries()
      const previousQueries = getAdminUsersListQueries()
      previousQueries.forEach(([queryKey, queryData]) => {
        if (!queryData) return
        queryClient.setQueryData<UsersListData>(queryKey, (old) => {
          if (!old) return old
          return {
            ...old,
            users: old.users.map((u) =>
              u.id === data.userId ? { ...u, role: data.role } : u,
            ),
          }
        })
      })
      return { previousQueries }
    },
    onSuccess: async () => {
      toast.success(t("errors.common.roleUpdated"))
      await refresh()
    },
    onError: (err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = JSON.stringify(query.queryKey)
          return queryKey.includes("adminUsers") && queryKey.includes("list")
        },
      })
    },
  })

  const updateUser = useMutation({
    mutationFn: (data: {
      userId: string
      name?: string
      email?: string
      role?: "student" | "company_admin" | "university_admin" | "super_admin"
    }) => orpcClient.adminUsers.update(data),
    onMutate: async (data) => {
      await cancelAdminUsersQueries()
      const previousQueries = getAdminUsersListQueries()
      previousQueries.forEach(([queryKey, queryData]) => {
        if (!queryData) return
        queryClient.setQueryData<UsersListData>(queryKey, (old) => {
          if (!old) return old
          return {
            ...old,
            users: old.users.map((u) =>
              u.id === data.userId
                ? {
                    ...u,
                    ...(data.name !== undefined && { name: data.name }),
                    ...(data.email !== undefined && { email: data.email }),
                    ...(data.role !== undefined && { role: data.role }),
                  }
                : u,
            ),
          }
        })
      })
      return { previousQueries }
    },
    onSuccess: async () => {
      await invalidate()
    },
    onError: (err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = JSON.stringify(query.queryKey)
          return queryKey.includes("adminUsers") && queryKey.includes("list")
        },
      })
    },
  })

  const banUser = useMutation({
    mutationFn: (data: {
      userId: string
      banReason?: string
      banExpiresIn?: number
    }) => orpcClient.adminUsers.ban(data),
    onMutate: async (data) => {
      await cancelAdminUsersQueries()
      const previousQueries = getAdminUsersListQueries()
      previousQueries.forEach(([queryKey, queryData]) => {
        if (!queryData) return
        queryClient.setQueryData<UsersListData>(queryKey, (old) => {
          if (!old) return old
          return {
            ...old,
            users: old.users.map((u) =>
              u.id === data.userId
                ? {
                    ...u,
                    banned: true,
                    ...(data.banReason !== undefined && {
                      banReason: data.banReason,
                    }),
                    ...(data.banExpiresIn !== undefined && {
                      banExpires: data.banExpiresIn,
                    }),
                  }
                : u,
            ),
          }
        })
      })
      return { previousQueries }
    },
    onSuccess: async () => {
      toast.success(t("errors.common.userBanned"))
      await refresh()
    },
    onError: (err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = JSON.stringify(query.queryKey)
          return queryKey.includes("adminUsers") && queryKey.includes("list")
        },
      })
    },
  })

  const unbanUser = useMutation({
    mutationFn: (data: { userId: string }) => orpcClient.adminUsers.unban(data),
    onMutate: async (data) => {
      await cancelAdminUsersQueries()
      const previousQueries = getAdminUsersListQueries()
      previousQueries.forEach(([queryKey, queryData]) => {
        if (!queryData) return
        queryClient.setQueryData<UsersListData>(queryKey, (old) => {
          if (!old) return old
          return {
            ...old,
            users: old.users.map((u) =>
              u.id === data.userId
                ? { ...u, banned: false, banReason: null, banExpires: null }
                : u,
            ),
          }
        })
      })
      return { previousQueries }
    },
    onSuccess: async () => {
      toast.success(t("errors.common.userUnbanned"))
      await refresh()
    },
    onError: (err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = JSON.stringify(query.queryKey)
          return queryKey.includes("adminUsers") && queryKey.includes("list")
        },
      })
    },
  })

  const removeUser = useMutation({
    mutationFn: (data: { userId: string }) =>
      orpcClient.adminUsers.remove(data),
    onMutate: async (data) => {
      await cancelAdminUsersQueries()
      const previousQueries = getAdminUsersListQueries()
      previousQueries.forEach(([queryKey, queryData]) => {
        if (!queryData) return
        queryClient.setQueryData<UsersListData>(queryKey, (old) => {
          if (!old) return old
          return {
            ...old,
            users: old.users.filter((u) => u.id !== data.userId),
            total: old.total - 1,
          }
        })
      })
      return { previousQueries }
    },
    onSuccess: async () => {
      toast.success(t("errors.common.userRemoved"))
      await refresh()
    },
    onError: (err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = JSON.stringify(query.queryKey)
          return queryKey.includes("adminUsers") && queryKey.includes("list")
        },
      })
    },
  })

  const setPassword = useMutation({
    mutationFn: (data: { userId: string; newPassword: string }) =>
      orpcClient.adminUsers.setPassword(data),
    onMutate: async () => {
      await cancelAdminUsersQueries()
      const previousQueries = getAdminUsersListQueries()
      return { previousQueries }
    },
    onSuccess: async () => {
      toast.success(t("errors.common.passwordUpdated"))
      await refresh()
    },
    onError: (err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.userActionFailed",
        }),
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = JSON.stringify(query.queryKey)
          return queryKey.includes("adminUsers") && queryKey.includes("list")
        },
      })
    },
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
