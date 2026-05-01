"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import {
  getInterviewsErrorMessage,
  mapCompanyApplications,
  mapCompanyOffers,
} from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsData.helpers"
import type {
  CompanyInterviewView,
  ConfirmSlotInput,
  StudentInterviewView,
  UseInterviewsDataParams,
  UseInterviewsDataResult,
} from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { isInterviewsFeatureDisabledError } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/utils"
import { resolveLocalizedError } from "@/lib/error-message"
import { orpc } from "@/server/orpc/client"

export function useInterviewsData({
  role,
  selectedOfferId,
}: UseInterviewsDataParams): UseInterviewsDataResult {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [confirmingSlotId, setConfirmingSlotId] = useState<string | null>(null)

  const studentListQueryOptions = orpc.interviews.listForStudent.queryOptions()
  const companyListQueryOptions = orpc.interviews.listForCompany.queryOptions()

  const studentInterviewsQuery = useQuery({
    ...studentListQueryOptions,
    enabled: role === "student",
  })

  const companyInterviewsQuery = useQuery({
    ...companyListQueryOptions,
    enabled: role === "company_admin",
  })

  const companyOffersQuery = useQuery({
    ...orpc.offers.listByCompany.queryOptions(),
    enabled: role === "company_admin",
  })

  const applicationsByOfferQuery = useQuery({
    ...orpc.applications.listByOffer.queryOptions({
      input: {
        offerId: selectedOfferId || "offer-not-selected",
        status: "applied",
        limit: 50,
      },
    }),
    enabled: role === "company_admin" && selectedOfferId.trim().length > 0,
  })

  const companyOffers = mapCompanyOffers(companyOffersQuery.data)
  const companyApplications = mapCompanyApplications(
    applicationsByOfferQuery.data?.applications,
  )

  const confirmSlotMutation = useMutation(
    orpc.interviews.confirmSlot.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: studentListQueryOptions.queryKey,
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

  const studentInterviews = (studentInterviewsQuery.data ??
    []) as StudentInterviewView[]
  const companyInterviews = (companyInterviewsQuery.data ??
    []) as CompanyInterviewView[]
  const studentErrorMessage = getInterviewsErrorMessage(
    studentInterviewsQuery.error,
    t,
  )
  const companyErrorMessage = getInterviewsErrorMessage(
    companyInterviewsQuery.error,
    t,
  )

  const isFeatureDisabled = [
    studentInterviewsQuery.error,
    companyInterviewsQuery.error,
    confirmSlotMutation.error,
  ].some((error) => error && isInterviewsFeatureDisabledError(error))

  return {
    studentInterviews,
    companyInterviews,
    companyOffers,
    companyApplications,
    studentErrorMessage,
    companyErrorMessage,
    isStudentLoading: studentInterviewsQuery.isLoading,
    isCompanyLoading: companyInterviewsQuery.isLoading,
    isOffersLoading: companyOffersQuery.isLoading,
    isApplicationsLoading: applicationsByOfferQuery.isLoading,
    confirmingSlotId,
    isFeatureDisabled,
    confirmSlot,
  }
}
