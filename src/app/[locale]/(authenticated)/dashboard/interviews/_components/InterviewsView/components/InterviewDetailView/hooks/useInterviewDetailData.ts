"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import type { ConfirmSlotInput, InterviewDetailViewProps } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/types"
import { resolveLocalizedError } from "@/lib/error-message"
import { orpc } from "@/server/orpc/client"

interface UseInterviewDetailDataParams {
  interviewId: string
  initialInterview?: InterviewDetailViewProps["interview"]
}

export function useInterviewDetailData({ interviewId, initialInterview }: UseInterviewDetailDataParams) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [confirmingSlotId, setConfirmingSlotId] = useState<string | null>(null)

  const interviewQuery = useQuery({
    ...orpc.interviews.getById.queryOptions({ input: { interviewId } }),
    initialData: initialInterview,
  })

  const confirmSlotMutation = useMutation(
    orpc.interviews.confirmSlot.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.interviews.getById.queryOptions({ input: { interviewId } }).queryKey,
        })
        await queryClient.invalidateQueries({
          queryKey: orpc.interviews.listForStudent.queryOptions().queryKey,
        })
        toast.success(t("errors.common.interviewSlotConfirmed"))
      },
      onError: (error) => {
        toast.error(
          resolveLocalizedError(error, {
            t,
            fallbackKey: "errors.common.confirmInterviewSlotFailed",
          }),
        )
      },
    }),
  )

  const confirmSlot = async (input: ConfirmSlotInput) => {
    setConfirmingSlotId(input.slotId)
    try {
      await confirmSlotMutation.mutateAsync(input)
    } finally {
      setConfirmingSlotId(null)
    }
  }

  return {
    interview: interviewQuery.data,
    isLoading: interviewQuery.isLoading,
    errorMessage: interviewQuery.error ? t("errors.common.interviewsLoadFailed") : null,
    confirmingSlotId,
    confirmSlot,
  }
}
