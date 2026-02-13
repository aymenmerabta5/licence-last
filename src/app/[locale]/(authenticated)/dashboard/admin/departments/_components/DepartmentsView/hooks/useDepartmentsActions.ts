"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { orpc } from "@/server/orpc/client"

export function useDepartmentsActions() {
  const queryClient = useQueryClient()

  const [newName, setNewName] = useState("")
  const [newHeadName, setNewHeadName] = useState("")

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["departments"] })
  }

  const createMutation = useMutation(
    orpc.departments.create.mutationOptions({ onSuccess: invalidate }),
  )

  const assignHeadMutation = useMutation(
    orpc.departments.assignHead.mutationOptions({ onSuccess: invalidate }),
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

  return {
    newName,
    setNewName,
    newHeadName,
    setNewHeadName,
    handleCreate,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    assignHeadMutation,
  }
}
