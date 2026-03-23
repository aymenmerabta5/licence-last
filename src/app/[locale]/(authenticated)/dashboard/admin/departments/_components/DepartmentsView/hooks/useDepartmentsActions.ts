"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useState } from "react"
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

  const [newName, setNewName] = useState("")
  const canCreate = Boolean(selectedUniversityId)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_LIST_QUERY_PATH] })
  }

  const createMutation = useMutation(
    orpc.departments.create.mutationOptions({
      onSuccess: () => {
        invalidate()
        toast.success(t("createSuccess"))
      },
      onError: (error) => {
        toast.error(
          resolveLocalizedError(error, {
            t: tr,
            fallbackKey: "dashboard.admin.departments.error",
          }),
        )
      },
    }),
  )

  const updateMutation = useMutation(
    orpc.departments.update.mutationOptions({
      onSuccess: () => {
        invalidate()
        toast.success(t("updateSuccess"))
      },
      onError: (error) => {
        toast.error(
          resolveLocalizedError(error, {
            t: tr,
            fallbackKey: "dashboard.admin.departments.error",
          }),
        )
      },
    }),
  )

  const assignHeadMutation = useMutation(
    orpc.departments.assignHead.mutationOptions({
      onSuccess: () => {
        invalidate()
        toast.success(t("assignSuccess"))
      },
      onError: (error) => {
        toast.error(
          resolveLocalizedError(error, {
            t: tr,
            fallbackKey: "dashboard.admin.departments.error",
          }),
        )
      },
    }),
  )

  const unassignHeadMutation = useMutation(
    orpc.departments.unassignHead.mutationOptions({
      onSuccess: () => {
        invalidate()
        toast.success(t("removeHeadSuccess"))
      },
      onError: (error) => {
        toast.error(
          resolveLocalizedError(error, {
            t: tr,
            fallbackKey: "dashboard.admin.departments.error",
          }),
        )
      },
    }),
  )

  const deleteDepartmentMutation = useMutation(
    orpc.departments.delete.mutationOptions({
      onSuccess: () => {
        invalidate()
        toast.success(t("deleteSuccess"))
      },
      onError: (error) => {
        toast.error(
          resolveLocalizedError(error, {
            t: tr,
            fallbackKey: "dashboard.admin.departments.error",
          }),
        )
      },
    }),
  )

  const handleCreate = () => {
    if (!newName.trim()) return
    if (!selectedUniversityId) {
      toast.error(t("selectUniversityFirst"))
      return
    }

    createMutation.mutate(
      { name: newName.trim(), universityId: selectedUniversityId },
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
    data: { name?: string },
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
