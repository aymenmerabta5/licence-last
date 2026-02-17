"use client"

import { useState } from "react"

import type { DepartmentItem } from "../types"

interface UseAssignHeadDialogParams {
  onAssign: (
    departmentId: string,
    headEmail: string,
    headName: string,
  ) => Promise<unknown>
}

export function useAssignHeadDialog({ onAssign }: UseAssignHeadDialogParams) {
  const [department, setDepartment] = useState<DepartmentItem | null>(null)
  const [headEmail, setHeadEmail] = useState("")
  const [headName, setHeadName] = useState("")

  const close = () => {
    setDepartment(null)
    setHeadEmail("")
    setHeadName("")
  }

  const open = (nextDepartment: DepartmentItem) => {
    setDepartment(nextDepartment)
    setHeadEmail("")
    setHeadName("")
  }

  const submit = async () => {
    if (!department) return
    if (!headEmail.trim() || !headName.trim()) return

    try {
      await onAssign(department.id, headEmail, headName)
      close()
    } catch {
      // Error feedback is handled by the mutation hook.
    }
  }

  return {
    department,
    headEmail,
    setHeadEmail,
    headName,
    setHeadName,
    open,
    close,
    submit,
  }
}
