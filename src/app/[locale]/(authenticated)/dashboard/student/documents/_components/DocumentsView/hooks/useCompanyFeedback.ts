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

  const trustIndicesQueryKey = orpc.companies.listTrustIndices.queryOptions()
    .queryKey

  const feedbackMutation = useMutation({
    ...orpc.companies.submitQualityFeedback.mutationOptions(),
    onMutate: async (variables: {
      placementId: string
      rating: number
      wouldRecommend: boolean
      comment?: string
    }) => {
      await queryClient.cancelQueries({ queryKey: trustIndicesQueryKey })
      const previousData = queryClient.getQueryData(trustIndicesQueryKey)

      if (activePlacement) {
        queryClient.setQueryData(trustIndicesQueryKey, (old) => {
          if (!Array.isArray(old)) return old
          return old.map((item) => {
            if (item.companyName !== activePlacement.companyName) return item

            const ratingBoost = Math.round((variables.rating / 5) * 5)
            const recommendBoost = variables.wouldRecommend ? 2 : 0
            const newFeedbackScore = Math.min(
              100,
              item.factors.feedbackScore + ratingBoost + recommendBoost,
            )
            const trustDelta = Math.round((ratingBoost + recommendBoost) * 0.3)
            const newTrustScore = Math.min(
              100,
              item.trustScore + trustDelta,
            )

            return {
              ...item,
              trustScore: newTrustScore,
              tier:
                newTrustScore >= 80
                  ? "excellent"
                  : newTrustScore >= 65
                    ? "good"
                    : newTrustScore >= 45
                      ? "watch"
                      : "low",
              factors: {
                ...item.factors,
                feedbackScore: newFeedbackScore,
              },
            }
          })
        })
      }

      return { previousData }
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(trustIndicesQueryKey, context.previousData)
      }
      toast.error(extractErrorMessage(error, t("submitError")))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trustIndicesQueryKey })
      toast.success(t("submitSuccess"))
    },
  })

  function openForPlacement(placement: FeedbackPlacementContext) {
    setActivePlacement(placement)
    setValues(DEFAULT_FEEDBACK_VALUES)
    setErrors({})
  }

  function onOpenChange(open: boolean) {
    if (!open) {
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

    setActivePlacement(null)
    setValues(DEFAULT_FEEDBACK_VALUES)
    setErrors({})

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
