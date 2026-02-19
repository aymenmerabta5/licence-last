"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { companyQualityFeedbackSchema } from "@/lib/schemas/company"
import { orpc } from "@/server/orpc/client"

interface FeedbackValidationError {
  issues: Array<{ path: PropertyKey[]; message: string }>
}

const DEFAULT_FEEDBACK_VALUES = {
  rating: 4,
  wouldRecommend: true,
  comment: "",
}

export interface FeedbackPlacementContext {
  placementId: string
  companyName: string
  offerTitle: string
}

export interface QualityFeedbackFormValues {
  rating: number
  wouldRecommend: boolean
  comment: string
}

export interface QualityFeedbackFormErrors {
  rating?: string
  comment?: string
}

export interface UseCompanyFeedbackResult {
  activePlacement: FeedbackPlacementContext | null
  isOpen: boolean
  values: QualityFeedbackFormValues
  errors: QualityFeedbackFormErrors
  isSubmitting: boolean
  openForPlacement: (placement: FeedbackPlacementContext) => void
  onOpenChange: (open: boolean) => void
  setFieldValue: <K extends keyof QualityFeedbackFormValues>(
    field: K,
    value: QualityFeedbackFormValues[K],
  ) => void
  submitFeedback: () => void
}

function extractErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = error.message
    if (typeof message === "string" && message.length > 0) {
      return message
    }
  }

  return fallback
}

function mapValidationErrors(
  error: FeedbackValidationError,
): QualityFeedbackFormErrors {
  const fieldErrors: QualityFeedbackFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (field === "rating" && !fieldErrors.rating) {
      fieldErrors.rating = issue.message
    }

    if (field === "comment" && !fieldErrors.comment) {
      fieldErrors.comment = issue.message
    }
  }

  return fieldErrors
}

export function useCompanyFeedback(): UseCompanyFeedbackResult {
  const queryClient = useQueryClient()
  const t = useTranslations("dashboard.documents.feedback")

  const [activePlacement, setActivePlacement] =
    useState<FeedbackPlacementContext | null>(null)
  const [values, setValues] = useState<QualityFeedbackFormValues>(
    DEFAULT_FEEDBACK_VALUES,
  )
  const [errors, setErrors] = useState<QualityFeedbackFormErrors>({})

  const feedbackMutation = useMutation(
    orpc.companies.submitQualityFeedback.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.companies.listTrustIndices.queryOptions().queryKey,
        })
        toast.success(t("submitSuccess"))
        setActivePlacement(null)
        setValues(DEFAULT_FEEDBACK_VALUES)
        setErrors({})
      },
      onError: (error) => {
        toast.error(extractErrorMessage(error, t("submitError")))
      },
    }),
  )

  function openForPlacement(placement: FeedbackPlacementContext) {
    setActivePlacement(placement)
    setValues(DEFAULT_FEEDBACK_VALUES)
    setErrors({})
  }

  function onOpenChange(open: boolean) {
    if (!open && !feedbackMutation.isPending) {
      setActivePlacement(null)
      setValues(DEFAULT_FEEDBACK_VALUES)
      setErrors({})
    }
  }

  function setFieldValue<K extends keyof QualityFeedbackFormValues>(
    field: K,
    value: QualityFeedbackFormValues[K],
  ) {
    setValues((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
  }

  function submitFeedback() {
    if (!activePlacement) {
      return
    }

    const parsed = companyQualityFeedbackSchema.safeParse({
      placementId: activePlacement.placementId,
      rating: values.rating,
      wouldRecommend: values.wouldRecommend,
      comment: values.comment.trim() || undefined,
    })

    if (!parsed.success) {
      setErrors(mapValidationErrors(parsed.error))
      return
    }

    feedbackMutation.mutate(parsed.data)
  }

  return {
    activePlacement,
    isOpen: activePlacement !== null,
    values,
    errors,
    isSubmitting: feedbackMutation.isPending,
    openForPlacement,
    onOpenChange,
    setFieldValue,
    submitFeedback,
  }
}
