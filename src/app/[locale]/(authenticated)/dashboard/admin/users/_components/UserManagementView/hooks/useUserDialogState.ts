"use client"

import { useState } from "react"

import type { AdminUser } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/types"

export function useUserDialogState() {
  const [createOpen, setCreateOpen] = useState(false)
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null)
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null)
  const [pwTarget, setPwTarget] = useState<AdminUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)

  return {
    createOpen,
    setCreateOpen,
    banTarget,
    setBanTarget,
    roleTarget,
    setRoleTarget,
    pwTarget,
    setPwTarget,
    deleteTarget,
    setDeleteTarget,
  }
}

export type UserDialogState = ReturnType<typeof useUserDialogState>
