"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { useRouter } from "@/i18n/routing"
import { orpc, orpcClient } from "@/server/orpc/client"

import type { AdminValidationSummary } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/types"

export function usePlacementActions(applicationId: string) {
  const t = useTranslations("dashboard.admin.validations.detail")
  const router = useRouter()
  const queryClient = useQueryClient()

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const [aiSummary, setAiSummary] = useState<AdminValidationSummary | null>(
    null,
  )

  const summaryMutation = useMutation(
    orpc.placements.generateValidationSummary.mutationOptions({
      onSuccess: (data) => {
        setAiSummary(data)
      },
    }),
  )

  const validateMutation = useMutation(
    orpc.placements.validate.mutationOptions({
      onSuccess: async (result) => {
        try {
          setPdfLoading(true)
          await orpcClient.documents.generateAgreement({
            placementId: result.placementId,
          })
        } catch (error) {
          console.error("Failed to generate PDF:", error)
        } finally {
          setPdfLoading(false)
        }

        queryClient.invalidateQueries({
          queryKey: ["placements", "listPending"],
        })
        router.push("/dashboard/admin/validations")
      },
      onError: () => {
        setActionLoading(false)
      },
    }),
  )

  const rejectMutation = useMutation(
    orpc.placements.reject.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["placements", "listPending"],
        })
        router.push("/dashboard/admin/validations")
      },
      onError: () => {
        setActionLoading(false)
      },
    }),
  )

  const handleValidate = () => {
    if (!startDate || !endDate) {
      alert(t("selectDates"))
      return
    }
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start >= end) {
      alert(t("invalidDates"))
      return
    }
    if (!window.confirm(t("confirmValidate"))) return

    setActionLoading(true)
    validateMutation.mutate({
      applicationId,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    })
  }

  const handleReject = () => {
    setActionLoading(true)
    rejectMutation.mutate({
      applicationId,
      reason: rejectReason || undefined,
    })
  }

  function generateAiSummary(application: Record<string, unknown>) {
    setAiSummary(null)
    summaryMutation.mutate({
      application: {
        ...application,
        selectedStartDate: startDate || null,
        selectedEndDate: endDate || null,
      },
    })
  }

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    rejectModal,
    setRejectModal,
    rejectReason,
    setRejectReason,
    actionLoading,
    pdfLoading,
    handleValidate,
    handleReject,
    aiSummary,
    isSummarizing: summaryMutation.isPending,
    summaryError: summaryMutation.error,
    generateAiSummary,
  }
}
