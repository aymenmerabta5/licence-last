"use client"

import { useMemo, useState } from "react"

import type { DepartmentItem } from "@/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/types"

interface UseDepartmentsViewStateParams {
  departments: DepartmentItem[]
}

export function useDepartmentsViewState({
  departments,
}: UseDepartmentsViewStateParams) {
  const [skillsModalDeptId, setSkillsModalDeptId] = useState<string | null>(
    null,
  )
  const [removeHeadTarget, setRemoveHeadTarget] =
    useState<DepartmentItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DepartmentItem | null>(null)
  const [editTarget, setEditTarget] = useState<DepartmentItem | null>(null)

  const skillsModalDept = useMemo(
    () =>
      departments.find((department) => department.id === skillsModalDeptId) ??
      null,
    [departments, skillsModalDeptId],
  )

  const handleSkillsModalChange = (open: boolean) => {
    if (!open) {
      setSkillsModalDeptId(null)
    }
  }

  const handleRemoveHeadOpenChange = (open: boolean) => {
    if (!open) {
      setRemoveHeadTarget(null)
    }
  }

  const handleDeleteOpenChange = (open: boolean) => {
    if (!open) {
      setDeleteTarget(null)
    }
  }

  const handleEditOpenChange = (open: boolean) => {
    if (!open) {
      setEditTarget(null)
    }
  }

  return {
    skillsModalDeptId,
    setSkillsModalDeptId,
    skillsModalDept,
    removeHeadTarget,
    setRemoveHeadTarget,
    deleteTarget,
    setDeleteTarget,
    editTarget,
    setEditTarget,
    handleSkillsModalChange,
    handleRemoveHeadOpenChange,
    handleDeleteOpenChange,
    handleEditOpenChange,
  }
}
