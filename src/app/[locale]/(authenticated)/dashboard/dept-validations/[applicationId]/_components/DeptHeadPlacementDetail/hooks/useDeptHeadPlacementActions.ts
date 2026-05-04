"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { InferRouterOutputs } from "@orpc/server"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import type { ValidationSummary } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations"
import { useRouter } from "@/i18n/routing"
import { orpc } from "@/server/orpc/client"
import type { AppRouter } from "@/server/orpc/router"

type ListPendingResult =
  InferRouterOutputs<AppRouter>["deptHead"]["listPending"]
type GetPendingByIdResult =
  InferRouterOutputs<AppRouter>["deptHead"]["getPendingById"]

export function useDeptHeadPlacementActions(applicationId: string) {
  const t = useTranslations("dashboard.admin.validations.detail")
  const router = useRouter()
  const queryClient = useQueryClient()

  const [validateModal, setValidateModal] = useState(false)
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [pdfLoading, _setPdfLoading] = useState(false)
  const [pdfError, _setPdfError] = useState<string | null>(null)

  const [aiSummary, setAiSummary] = useState<ValidationSummary | null>(null)

  const listPendingQueryKey = orpc.deptHead.listPending.queryOptions().queryKey
  const pendingByIdQueryKey = orpc.deptHead.getPendingById.queryOptions({
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
    ...orpc.deptHead.validate.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: listPendingQueryKey })
      await queryClient.cancelQueries({ queryKey: pendingByIdQueryKey })
      const previousListData =
        queryClient.getQueryData<ListPendingResult>(listPendingQueryKey)
      const previousDetailData =
        queryClient.getQueryData<GetPendingByIdResult>(pendingByIdQueryKey)

      if (previousListData) {
        queryClient.setQueryData<ListPendingResult>(
          listPendingQueryKey,
          (old) => {
            if (!old) return old
            return {
              ...old,
              applications: old.applications.filter(
                (app) => app.id !== variables.applicationId,
              ),
            }
          },
        )
      }

      if (previousDetailData) {
        queryClient.setQueryData<GetPendingByIdResult>(
          pendingByIdQueryKey,
          (old) => {
            if (!old) return old
            return { ...old, application: null }
          },
        )
      }

      return { previousListData, previousDetailData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousListData) {
        queryClient.setQueryData(listPendingQueryKey, context.previousListData)
      }
      if (context?.previousDetailData) {
        queryClient.setQueryData(
          pendingByIdQueryKey,
          context.previousDetailData,
        )
      }
      toast.error(t("validateError"))
      setActionLoading(false)
    },
    onSuccess: async (_result) => {
      queryClient.invalidateQueries({
        queryKey: ["deptHead", "listPending"],
      })
      queryClient.invalidateQueries({
        queryKey: ["applications", "hub", "journeys"],
      })
      toast.success(t("validateSuccess"))
      setActionLoading(false)
      router.push("/dashboard/dept-validations")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listPendingQueryKey })
      queryClient.invalidateQueries({ queryKey: pendingByIdQueryKey })
    },
  })

  const rejectMutation = useMutation({
    ...orpc.deptHead.reject.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: listPendingQueryKey })
      await queryClient.cancelQueries({ queryKey: pendingByIdQueryKey })
      const previousListData =
        queryClient.getQueryData<ListPendingResult>(listPendingQueryKey)
      const previousDetailData =
        queryClient.getQueryData<GetPendingByIdResult>(pendingByIdQueryKey)

      if (previousListData) {
        queryClient.setQueryData<ListPendingResult>(
          listPendingQueryKey,
          (old) => {
            if (!old) return old
            return {
              ...old,
              applications: old.applications.filter(
                (app) => app.id !== variables.applicationId,
              ),
            }
          },
        )
      }

      if (previousDetailData) {
        queryClient.setQueryData<GetPendingByIdResult>(
          pendingByIdQueryKey,
          (old) => {
            if (!old) return old
            return { ...old, application: null }
          },
        )
      }

      return { previousListData, previousDetailData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousListData) {
        queryClient.setQueryData(listPendingQueryKey, context.previousListData)
      }
      if (context?.previousDetailData) {
        queryClient.setQueryData(
          pendingByIdQueryKey,
          context.previousDetailData,
        )
      }
      toast.error(t("rejectError"))
      setActionLoading(false)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["deptHead", "listPending"],
      })
      toast.success(t("rejectSuccess"))
      setActionLoading(false)
      router.push("/dashboard/dept-validations")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listPendingQueryKey })
      queryClient.invalidateQueries({ queryKey: pendingByIdQueryKey })
    },
  })

  const handleValidate = () => {
    setValidateModal(true)
  }

  const handleConfirmValidate = () => {
    setValidateModal(false)

    setActionLoading(true)
    validateMutation.mutate({ applicationId })
  }

  const handleReject = () => {
    setRejectModal(false)
    setActionLoading(true)
    rejectMutation.mutate({
      applicationId,
      reason: rejectReason || undefined,
    })
  }

  function generateAiSummary(application: Record<string, unknown>) {
    setAiSummary(null)
    summaryMutation.mutate({
      application,
    })
  }

  return {
    rejectModal,
    setRejectModal,
    validateModal,
    setValidateModal,
    rejectReason,
    setRejectReason,
    actionLoading,
    pdfLoading,
    pdfError,
    handleValidate,
    handleConfirmValidate,
    handleReject,
    aiSummary,
    isSummarizing: summaryMutation.isPending,
    summaryError: summaryMutation.error,
    generateAiSummary,
  }
}
