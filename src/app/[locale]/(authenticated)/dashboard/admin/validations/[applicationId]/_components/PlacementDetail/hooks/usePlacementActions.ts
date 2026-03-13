"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { ValidationSummary } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations"
import { useRouter } from "@/i18n/routing"
import { orpc, orpcClient } from "@/server/orpc/client"

function toDateInputValue(value: Date | string | null | undefined): string {
  if (!value) return ""

  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ""

  return date.toISOString().split("T")[0]
}

function isBeforeDate(dateA: string, dateB: string): boolean {
  return new Date(dateA).getTime() < new Date(dateB).getTime()
}

function isAfterDate(dateA: string, dateB: string): boolean {
  return new Date(dateA).getTime() > new Date(dateB).getTime()
}

export function usePlacementActions(
  applicationId: string,
  expectedDates?: {
    expectedStartDate?: Date | string | null
    expectedEndDate?: Date | string | null
  },
) {
  const t = useTranslations("dashboard.admin.validations.detail")
  const router = useRouter()
  const queryClient = useQueryClient()

  const expectedStartDate = toDateInputValue(expectedDates?.expectedStartDate)
  const expectedEndDate = toDateInputValue(expectedDates?.expectedEndDate)

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const [aiSummary, setAiSummary] = useState<ValidationSummary | null>(null)

  useEffect(() => {
    if (!startDate && expectedStartDate) {
      setStartDate(expectedStartDate)
    }
    if (!endDate && expectedEndDate) {
      setEndDate(expectedEndDate)
    }
  }, [startDate, endDate, expectedStartDate, expectedEndDate])

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
          toast.error(t("agreementGenerationError"))
        } finally {
          setPdfLoading(false)
        }

        queryClient.invalidateQueries({
          queryKey: ["placements", "listPending"],
        })
        toast.success(t("validateSuccess"))
        setActionLoading(false)
        router.push("/dashboard/admin/validations")
      },
      onError: () => {
        toast.error(t("validateError"))
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
        toast.success(t("rejectSuccess"))
        setActionLoading(false)
        router.push("/dashboard/admin/validations")
      },
      onError: () => {
        toast.error(t("rejectError"))
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

  const isBeforeExpectedStart = expectedStartDate
    ? isBeforeDate(startDate, expectedStartDate)
    : false
  const isAfterExpectedEnd = expectedEndDate
    ? isAfterDate(endDate, expectedEndDate)
    : false

  const showOutOfRangeWarning =
    !!startDate && !!endDate && (isBeforeExpectedStart || isAfterExpectedEnd)

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    expectedStartDate,
    expectedEndDate,
    showOutOfRangeWarning,
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
