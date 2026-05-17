"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { resolveLocalizedError } from "@/lib/error-message"
import { orpc } from "@/server/orpc/client"

const DEPARTMENTS_LIST_QUERY_PATH = orpc.departments.list.queryOptions({
  input: { universityId: "__all__" },
}).queryKey[0]

export function useDepartmentsActions(selectedUniversityId: string | null) {
  const tr = useTranslations()
  const t = useTranslations("dashboard.admin.departments")
  const queryClient = useQueryClient()

  const listQueryOptions = useMemo(
    () =>
      orpc.departments.list.queryOptions({
        input: { universityId: selectedUniversityId ?? "" },
      }),
    [selectedUniversityId],
  )

  const [newName, setNewName] = useState("")
  const canCreate = Boolean(selectedUniversityId)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_LIST_QUERY_PATH] })
  }

  const createMutation = useMutation({
    ...orpc.departments.create.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: listQueryOptions.queryKey })
      const previousData = queryClient.getQueryData(listQueryOptions.queryKey)
      queryClient.setQueryData(listQueryOptions.queryKey, (old) => {
        if (!old) return old
        return [
          ...old,
          {
            id: `optimistic-${Date.now()}`,
            name: variables.name,
            headUserId: null,
            headUserName: null,
            headUserEmail: null,
            skillCount: 0,
            createdAt: new Date(),
            fieldName: null,
          },
        ]
      })
      return { previousData }
    },
    onSuccess: () => {
      invalidate()
      toast.success(t("createSuccess"))
    },
    onError: (error, _variables, context) => {
      toast.error(
        resolveLocalizedError(error, {
          t: tr,
          fallbackKey: "dashboard.admin.departments.error",
        }),
      )
      if (context?.previousData) {
        queryClient.setQueryData(
          listQueryOptions.queryKey,
          context.previousData,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listQueryOptions.queryKey })
    },
  })

  const updateMutation = useMutation({
    ...orpc.departments.update.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: listQueryOptions.queryKey })
      const previousData = queryClient.getQueryData(listQueryOptions.queryKey)
      queryClient.setQueryData(listQueryOptions.queryKey, (old) => {
        if (!old) return old
        return old.map((dept) =>
          dept.id === variables.departmentId
            ? { ...dept, name: variables.name ?? dept.name }
            : dept,
        )
      })
      return { previousData }
    },
    onSuccess: () => {
      invalidate()
      toast.success(t("updateSuccess"))
    },
    onError: (error, _variables, context) => {
      toast.error(
        resolveLocalizedError(error, {
          t: tr,
          fallbackKey: "dashboard.admin.departments.error",
        }),
      )
      if (context?.previousData) {
        queryClient.setQueryData(
          listQueryOptions.queryKey,
          context.previousData,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listQueryOptions.queryKey })
    },
  })

  const assignHeadMutation = useMutation({
    ...orpc.departments.assignHead.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: listQueryOptions.queryKey })
      const previousData = queryClient.getQueryData(listQueryOptions.queryKey)
      queryClient.setQueryData(listQueryOptions.queryKey, (old) => {
        if (!old) return old
        return old.map((dept) =>
          dept.id === variables.departmentId
            ? {
                ...dept,
                headUserEmail: variables.headEmail ?? dept.headUserEmail,
              }
            : dept,
        )
      })
      return { previousData }
    },
    onSuccess: () => {
      invalidate()
      toast.success(t("assignSuccess"))
    },
    onError: (error, _variables, context) => {
      toast.error(
        resolveLocalizedError(error, {
          t: tr,
          fallbackKey: "dashboard.admin.departments.error",
        }),
      )
      if (context?.previousData) {
        queryClient.setQueryData(
          listQueryOptions.queryKey,
          context.previousData,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listQueryOptions.queryKey })
    },
  })

  const unassignHeadMutation = useMutation({
    ...orpc.departments.unassignHead.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: listQueryOptions.queryKey })
      const previousData = queryClient.getQueryData(listQueryOptions.queryKey)
      queryClient.setQueryData(listQueryOptions.queryKey, (old) => {
        if (!old) return old
        return old.map((dept) =>
          dept.id === variables.departmentId
            ? {
                ...dept,
                headUserId: null,
                headUserName: null,
                headUserEmail: null,
              }
            : dept,
        )
      })
      return { previousData }
    },
    onSuccess: () => {
      invalidate()
      toast.success(t("removeHeadSuccess"))
    },
    onError: (error, _variables, context) => {
      toast.error(
        resolveLocalizedError(error, {
          t: tr,
          fallbackKey: "dashboard.admin.departments.error",
        }),
      )
      if (context?.previousData) {
        queryClient.setQueryData(
          listQueryOptions.queryKey,
          context.previousData,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listQueryOptions.queryKey })
    },
  })

  const deleteDepartmentMutation = useMutation({
    ...orpc.departments.delete.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: listQueryOptions.queryKey })
      const previousData = queryClient.getQueryData(listQueryOptions.queryKey)
      queryClient.setQueryData(listQueryOptions.queryKey, (old) => {
        if (!old) return old
        return old.filter((dept) => dept.id !== variables.departmentId)
      })
      return { previousData }
    },
    onSuccess: () => {
      invalidate()
      toast.success(t("deleteSuccess"))
    },
    onError: (error, _variables, context) => {
      toast.error(
        resolveLocalizedError(error, {
          t: tr,
          fallbackKey: "dashboard.admin.departments.error",
        }),
      )
      if (context?.previousData) {
        queryClient.setQueryData(
          listQueryOptions.queryKey,
          context.previousData,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listQueryOptions.queryKey })
    },
  })

  const handleCreate = (data: { name: string }) => {
    if (!data.name.trim()) return
    if (!selectedUniversityId) {
      toast.error(t("selectUniversityFirst"))
      return
    }

    createMutation.mutate(
      {
        name: data.name.trim(),
        universityId: selectedUniversityId,
      },
      {
        onSuccess: () => {
          setNewName("")
        },
      },
    )
  }

  const assignHead = async (departmentId: string, headEmail: string) =>
    assignHeadMutation.mutateAsync({
      departmentId,
      headEmail: headEmail.trim(),
    })

  const updateDepartment = async (
    departmentId: string,
    data: { name?: string; fieldId?: string | null },
  ) => updateMutation.mutateAsync({ departmentId, ...data })

  const unassignHead = async (departmentId: string) =>
    unassignHeadMutation.mutateAsync({ departmentId })

  const removeDepartment = async (departmentId: string) =>
    deleteDepartmentMutation.mutateAsync({ departmentId })

  return {
    newName,
    setNewName,
    canCreate,
    handleCreate,
    updateDepartment,
    assignHead,
    unassignHead,
    removeDepartment,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isAssigningHead: assignHeadMutation.isPending,
    isUnassigningHead: unassignHeadMutation.isPending,
    isDeletingDepartment: deleteDepartmentMutation.isPending,
    createError: createMutation.error,
  }
}
