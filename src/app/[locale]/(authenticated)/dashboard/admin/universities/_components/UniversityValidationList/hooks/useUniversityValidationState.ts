"use client"

import { useState } from "react"

import type { UniversityListItem } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/types"

export function useUniversityValidationState() {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingUniversity, setEditingUniversity] = useState<UniversityListItem | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingUniversity, setDeletingUniversity] = useState<UniversityListItem | null>(null)

  function handleRejectClick(id: string) {
    setRejectingId(id)
    setRejectDialogOpen(true)
  }

  function handleEditClick(university: UniversityListItem) {
    setEditingUniversity(university)
    setEditDialogOpen(true)
  }

  function handleDeleteClick(university: UniversityListItem) {
    setDeletingUniversity(university)
    setDeleteDialogOpen(true)
  }

  function handleRejectDialogChange(open: boolean) {
    setRejectDialogOpen(open)
    if (!open) {
      setRejectingId(null)
    }
  }

  function handleEditDialogChange(open: boolean) {
    setEditDialogOpen(open)
    if (!open) {
      setEditingUniversity(null)
    }
  }

  function handleDeleteDialogChange(open: boolean) {
    setDeleteDialogOpen(open)
    if (!open) {
      setDeletingUniversity(null)
    }
  }

  return {
    rejectDialogOpen,
    rejectingId,
    editDialogOpen,
    editingUniversity,
    deleteDialogOpen,
    deletingUniversity,
    handleRejectClick,
    handleEditClick,
    handleDeleteClick,
    handleRejectDialogChange,
    handleEditDialogChange,
    handleDeleteDialogChange,
  }
}
