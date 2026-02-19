"use client"

import { useState } from "react"

export function useCompanyValidationState() {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  function handleRejectClick(companyId: string) {
    setRejectingId(companyId)
    setRejectDialogOpen(true)
  }

  function handleRejectDialogChange(open: boolean) {
    setRejectDialogOpen(open)
    if (!open) {
      setRejectingId(null)
    }
  }

  return {
    rejectDialogOpen,
    rejectingId,
    handleRejectClick,
    handleRejectDialogChange,
  }
}
