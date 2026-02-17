"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { useRouter } from "@/i18n/routing"
import { orpc, orpcClient } from "@/server/orpc/client"

type ValidationSummary = {
  summaryBullets: string[]
  checklist: string[]
  potentialInconsistencies: string[]
}

export function useDeptHeadPlacementActions(applicationId: string) {
  const t = useTranslations("dashboard.admin.validations.detail")
  const router = useRouter()
  const queryClient = useQueryClient()

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [validateModal, setValidateModal] = useState(false)
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const [aiSummary, setAiSummary] = useState<ValidationSummary | null>(null)

  const summaryMutation = useMutation(
    orpc.placements.generateValidationSummary.mutationOptions({
      onSuccess: (data) => {
        setAiSummary(data)
      },
    }),
  )

  const validateMutation = useMutation(
    orpc.deptHead.validate.mutationOptions({
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
          queryKey: ["deptHead", "listPending"],
        })
        router.push("/dashboard/dept-validations")
      },
      onError: () => {
        setActionLoading(false)
      },
    }),
  )

  const rejectMutation = useMutation(
    orpc.deptHead.reject.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["deptHead", "listPending"],
        })
        router.push("/dashboard/dept-validations")
      },
      onError: () => {
        setActionLoading(false)
      },
    }),
  )

  const getValidatedDates = () => {
    if (!startDate || !endDate) {
      alert(t("selectDates"))
      return null
    }
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start >= end) {
      alert(t("invalidDates"))
      return null
    }

    return { start, end }
  }

  const handleValidate = () => {
    const dates = getValidatedDates()
    if (!dates) return

    setValidateModal(true)
  }

  const handleConfirmValidate = () => {
    const dates = getValidatedDates()
    if (!dates) return

    setValidateModal(false)

    setActionLoading(true)
    validateMutation.mutate({
      applicationId,
      startDate: dates.start.toISOString(),
      endDate: dates.end.toISOString(),
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
    validateModal,
    setValidateModal,
    rejectModal,
    setRejectModal,
    rejectReason,
    setRejectReason,
    actionLoading,
    pdfLoading,
    handleValidate,
    handleConfirmValidate,
    handleReject,
    aiSummary,
    isSummarizing: summaryMutation.isPending,
    summaryError: summaryMutation.error,
    generateAiSummary,
  }
}
