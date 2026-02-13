"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { orpc } from "@/server/orpc/client"

export function useCompanyOffers() {
  const queryClient = useQueryClient()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { data: offers = [], isLoading } = useQuery(
    orpc.offers.listByCompany.queryOptions(),
  )

  const companyId = offers[0]?.companyId
  const trustQuery = useQuery({
    ...orpc.companies.getTrustIndex.queryOptions({
      input: { companyId: companyId ?? "" },
    }),
    enabled: !!companyId,
  })

  const queryKey = useMemo(
    () => orpc.offers.listByCompany.queryOptions().queryKey,
    [],
  )

  const statusMutation = useMutation(
    orpc.offers.updateStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey })
      },
    }),
  )

  const deleteMutation = useMutation(
    orpc.offers.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey })
      },
    }),
  )

  const handlePublish = async (offerId: string) => {
    setActionLoading(offerId)
    try {
      await statusMutation.mutateAsync({ offerId, action: "publish" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleClose = async (offerId: string, confirmMessage: string) => {
    if (!window.confirm(confirmMessage)) return
    setActionLoading(offerId)
    try {
      await statusMutation.mutateAsync({ offerId, action: "close" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (offerId: string, confirmMessage: string) => {
    if (!window.confirm(confirmMessage)) return
    setActionLoading(offerId)
    try {
      await deleteMutation.mutateAsync({ offerId })
    } finally {
      setActionLoading(null)
    }
  }

  return {
    offers,
    isLoading,
    trustData: trustQuery.data ?? null,
    actionLoading,
    handlePublish,
    handleClose,
    handleDelete,
  }
}
