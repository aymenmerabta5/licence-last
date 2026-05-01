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

  const detailQueryKey = orpc.interviews.getById.queryOptions({ input: { interviewId } }).queryKey
  const studentListQueryKey = orpc.interviews.listForStudent.queryOptions().queryKey
  const companyListQueryKey = orpc.interviews.listForCompany.queryOptions().queryKey

  const confirmSlotMutation = useMutation({
    ...orpc.interviews.confirmSlot.mutationOptions(),
    onMutate: async (variables) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: detailQueryKey }),
        queryClient.cancelQueries({ queryKey: studentListQueryKey }),
        queryClient.cancelQueries({ queryKey: companyListQueryKey }),
      ])

      const previousDetail = queryClient.getQueryData(detailQueryKey)
      const previousStudentList = queryClient.getQueryData(studentListQueryKey)
      const previousCompanyList = queryClient.getQueryData(companyListQueryKey)

      queryClient.setQueryData(detailQueryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          status: "confirmed" as const,
          confirmedSlotId: variables.slotId,
          confirmedAt: new Date(),
        }
      })

      queryClient.setQueryData(studentListQueryKey, (old) => {
        if (!Array.isArray(old)) return old
        return old.map((interview) => {
          if (interview.id !== variables.interviewId) return interview
          return {
            ...interview,
            status: "confirmed" as const,
            confirmedSlotId: variables.slotId,
            confirmedAt: new Date(),
          }
        }) as typeof old
      })

      queryClient.setQueryData(companyListQueryKey, (old) => {
        if (!Array.isArray(old)) return old
        return old.map((interview) => {
          if (interview.id !== variables.interviewId) return interview
          return {
            ...interview,
            status: "confirmed" as const,
            confirmedSlotId: variables.slotId,
            confirmedAt: new Date(),
          }
        }) as typeof old
      })

      return { previousDetail, previousStudentList, previousCompanyList }
    },
    onSuccess: () => {
      toast.success(t("errors.common.interviewSlotConfirmed"))
    },
    onError: (error, _variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(detailQueryKey, context.previousDetail)
      }
      if (context?.previousStudentList) {
        queryClient.setQueryData(studentListQueryKey, context.previousStudentList)
      }
      if (context?.previousCompanyList) {
        queryClient.setQueryData(companyListQueryKey, context.previousCompanyList)
      }

      toast.error(
        resolveLocalizedError(error, {
          t,
          fallbackKey: "errors.common.confirmInterviewSlotFailed",
        }),
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: detailQueryKey })
      queryClient.invalidateQueries({ queryKey: studentListQueryKey })
      queryClient.invalidateQueries({ queryKey: companyListQueryKey })
    },
  })

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
