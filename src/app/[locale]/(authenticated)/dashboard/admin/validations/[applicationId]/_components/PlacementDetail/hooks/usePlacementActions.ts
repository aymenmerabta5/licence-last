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
  const [pdfError, setPdfError] = useState<string | null>(null)

  const [aiSummary, setAiSummary] = useState<ValidationSummary | null>(null)

  useEffect(() => {
    if (!startDate && expectedStartDate) {
      setStartDate(expectedStartDate)
    }
    if (!endDate && expectedEndDate) {
      setEndDate(expectedEndDate)
    }
  }, [startDate, endDate, expectedStartDate, expectedEndDate])

  const listPendingQueryKey = ["placements", "listPending"] as const
  const detailQueryKey = orpc.placements.getPendingById.queryOptions({
    input: { applicationId },
  }).queryKey

  const summaryMutation = useMutation(
    orpc.placements.generateValidationSummary.mutationOptions({
      onSuccess: (data) => {
        setAiSummary(data)
      },
    }),
  )

  const validateMutation = useMutation({
    ...orpc.placements.validate.mutationOptions(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: listPendingQueryKey })
      await queryClient.cancelQueries({ queryKey: detailQueryKey })

      const previousListData = queryClient.getQueryData(listPendingQueryKey)
      const previousDetailData = queryClient.getQueryData(detailQueryKey)

      queryClient.setQueryData(listPendingQueryKey, (old) => {
        if (!old || typeof old !== "object") return old
        const record = old as {
          pages?: Array<{ applications?: unknown[] }>
          pageParams?: unknown[]
        }
        if (!Array.isArray(record.pages)) return old
        return {
          ...record,
          pages: record.pages.map((page) => {
            if (!page || typeof page !== "object") return page
            const p = page as { applications?: unknown[] }
            if (!Array.isArray(p.applications)) return page
            return {
              ...p,
              applications: p.applications.filter(
                (app) => (app as { id?: string }).id !== applicationId,
              ),
            }
          }),
        }
      })

      queryClient.setQueryData(detailQueryKey, (old) => {
        if (!old || !old.application) return old
        return {
          ...old,
          application: {
            ...old.application,
            status: "admin_validated" as const,
          },
        }
      })

      return { previousListData, previousDetailData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousListData) {
        queryClient.setQueryData(listPendingQueryKey, context.previousListData)
      }
      if (context?.previousDetailData) {
        queryClient.setQueryData(detailQueryKey, context.previousDetailData)
      }
      toast.error(t("validateError"))
      setActionLoading(false)
    },
    onSuccess: async (result) => {
      try {
        setPdfLoading(true)
        setPdfError(null)
        await orpcClient.documents.generateAgreement({
          placementId: result.placementId,
        })
      } catch (error) {
        setPdfError(
          error instanceof Error
            ? error.message
            : t("agreementGenerationError"),
        )
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
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["placements", "listPending"],
      })
      queryClient.invalidateQueries({ queryKey: detailQueryKey })
    },
  })

  const rejectMutation = useMutation({
    ...orpc.placements.reject.mutationOptions(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: listPendingQueryKey })
      await queryClient.cancelQueries({ queryKey: detailQueryKey })

      const previousListData = queryClient.getQueryData(listPendingQueryKey)
      const previousDetailData = queryClient.getQueryData(detailQueryKey)

      queryClient.setQueryData(listPendingQueryKey, (old) => {
        if (!old || typeof old !== "object") return old
        const record = old as {
          pages?: Array<{ applications?: unknown[] }>
          pageParams?: unknown[]
        }
        if (!Array.isArray(record.pages)) return old
        return {
          ...record,
          pages: record.pages.map((page) => {
            if (!page || typeof page !== "object") return page
            const p = page as { applications?: unknown[] }
            if (!Array.isArray(p.applications)) return page
            return {
              ...p,
              applications: p.applications.filter(
                (app) => (app as { id?: string }).id !== applicationId,
              ),
            }
          }),
        }
      })

      queryClient.setQueryData(detailQueryKey, (old) => {
        if (!old || !old.application) return old
        return {
          ...old,
          application: {
            ...old.application,
            status: "admin_rejected" as const,
          },
        }
      })

      return { previousListData, previousDetailData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousListData) {
        queryClient.setQueryData(listPendingQueryKey, context.previousListData)
      }
      if (context?.previousDetailData) {
        queryClient.setQueryData(detailQueryKey, context.previousDetailData)
      }
      toast.error(t("rejectError"))
      setActionLoading(false)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["placements", "listPending"],
      })
      toast.success(t("rejectSuccess"))
      setActionLoading(false)
      router.push("/dashboard/admin/validations")
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["placements", "listPending"],
      })
      queryClient.invalidateQueries({ queryKey: detailQueryKey })
    },
  })

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
    pdfError,
    handleValidate,
    handleReject,
    aiSummary,
    isSummarizing: summaryMutation.isPending,
    summaryError: summaryMutation.error,
    generateAiSummary,
  }
}
