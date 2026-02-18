"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { orpc } from "@/server/orpc/client"

export function useCompanyOffers() {
  const t = useTranslations("dashboard.company.offers")
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
    orpc.offers.updateStatus.mutationOptions(),
  )

  const deleteMutation = useMutation(
    orpc.offers.delete.mutationOptions(),
  )

  const handlePublish = async (offerId: string) => {
    setActionLoading(offerId)
    try {
      const result = await statusMutation.mutateAsync({ offerId, action: "publish" })
      queryClient.setQueryData<typeof offers>(queryKey, (current = []) =>
        current.map((offer) =>
          offer.id === offerId
            ? { ...offer, status: result.newStatus }
            : offer,
        ),
      )
      await queryClient.invalidateQueries({ queryKey })
      toast.success(t("toasts.publishSuccess"))
    } catch {
      toast.error(t("form.error"))
    } finally {
      setActionLoading(null)
    }
  }

  const handleClose = async (offerId: string, confirmMessage: string) => {
    if (!window.confirm(confirmMessage)) return
    setActionLoading(offerId)
    try {
      const result = await statusMutation.mutateAsync({ offerId, action: "close" })
      queryClient.setQueryData<typeof offers>(queryKey, (current = []) =>
        current.map((offer) =>
          offer.id === offerId
            ? { ...offer, status: result.newStatus }
            : offer,
        ),
      )
      await queryClient.invalidateQueries({ queryKey })
      toast.success(t("toasts.closeSuccess"))
    } catch {
      toast.error(t("form.error"))
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (offerId: string, confirmMessage: string) => {
    if (!window.confirm(confirmMessage)) return
    setActionLoading(offerId)
    try {
      await deleteMutation.mutateAsync({ offerId })
      queryClient.setQueryData<typeof offers>(queryKey, (current = []) =>
        current.filter((offer) => offer.id !== offerId),
      )
      await queryClient.invalidateQueries({ queryKey })
      toast.success(t("toasts.deleteSuccess"))
    } catch {
      toast.error(t("form.error"))
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
