"use client"

import { useState } from "react"

import type { CompanyListItem } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/types"

export function useCompanyValidationState() {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingCompany, setDeletingCompany] = useState<CompanyListItem | null>(
    null,
  )

  function handleRejectClick(companyId: string) {
    setRejectingId(companyId)
    setRejectDialogOpen(true)
  }

  function handleDeleteClick(company: CompanyListItem) {
    setDeletingCompany(company)
    setDeleteDialogOpen(true)
  }

  function handleRejectDialogChange(open: boolean) {
    setRejectDialogOpen(open)
    if (!open) {
      setRejectingId(null)
    }
  }

  function handleDeleteDialogChange(open: boolean) {
    setDeleteDialogOpen(open)
    if (!open) {
      setDeletingCompany(null)
    }
  }

  return {
    rejectDialogOpen,
    rejectingId,
    deleteDialogOpen,
    deletingCompany,
    handleRejectClick,
    handleDeleteClick,
    handleRejectDialogChange,
    handleDeleteDialogChange,
  }
}
