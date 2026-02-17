"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { orpc } from "@/server/orpc/client"

export function useDepartmentsActions() {
  const t = useTranslations("dashboard.admin.departments")
  const queryClient = useQueryClient()

  const [newName, setNewName] = useState("")
  const [newHeadName, setNewHeadName] = useState("")

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["departments"] })
  }

  const createMutation = useMutation(
    orpc.departments.create.mutationOptions({
      onSuccess: () => {
        invalidate()
        toast.success(t("createSuccess"))
      },
      onError: (error) => {
        toast.error(error.message || t("error"))
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
        toast.error(error.message || t("error"))
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
        toast.error(error.message || t("error"))
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
        toast.error(error.message || t("error"))
      },
    }),
  )

  const handleCreate = () => {
    if (!newName.trim()) return
    createMutation.mutate(
      { name: newName.trim(), headName: newHeadName.trim() || undefined },
      {
        onSuccess: () => {
          setNewName("")
          setNewHeadName("")
        },
      },
    )
  }

  const assignHead = async (
    departmentId: string,
    headEmail: string,
    headName: string,
  ) =>
    assignHeadMutation.mutateAsync({
      departmentId,
      headEmail: headEmail.trim(),
      headName: headName.trim(),
    })

  const unassignHead = async (departmentId: string) =>
    unassignHeadMutation.mutateAsync({ departmentId })

  const removeDepartment = async (departmentId: string) =>
    deleteDepartmentMutation.mutateAsync({ departmentId })

  return {
    newName,
    setNewName,
    newHeadName,
    setNewHeadName,
    handleCreate,
    assignHead,
    unassignHead,
    removeDepartment,
    isCreating: createMutation.isPending,
    isAssigningHead: assignHeadMutation.isPending,
    isUnassigningHead: unassignHeadMutation.isPending,
    isDeletingDepartment: deleteDepartmentMutation.isPending,
    createError: createMutation.error,
  }
}
