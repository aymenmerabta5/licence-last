"use client"

import { useState } from "react"

import type { DepartmentItem } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/types"

interface UseAssignHeadDialogParams {
  onAssign: (departmentId: string, headEmail: string) => Promise<unknown>
}

export function useAssignHeadDialog({ onAssign }: UseAssignHeadDialogParams) {
  const [department, setDepartment] = useState<DepartmentItem | null>(null)
  const [headEmail, setHeadEmail] = useState("")

  const close = () => {
    setDepartment(null)
    setHeadEmail("")
  }

  const open = (nextDepartment: DepartmentItem) => {
    setDepartment(nextDepartment)
    setHeadEmail("")
  }

  const submit = async () => {
    if (!department) return
    if (!headEmail.trim()) return

    try {
      await onAssign(department.id, headEmail)
      close()
    } catch {
      // Error feedback is handled by the mutation hook.
    }
  }

  return {
    department,
    headEmail,
    setHeadEmail,
    open,
    close,
    submit,
  }
}
