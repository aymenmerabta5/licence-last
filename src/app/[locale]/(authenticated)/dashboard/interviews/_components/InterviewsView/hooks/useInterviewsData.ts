"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/lib/error-message"
import { orpc } from "@/server/orpc/client"

import type {
  CompanyInterviewView,
  ConfirmSlotInput,
  ProposeSlotsInput,
  StudentInterviewView,
  UseInterviewsDataParams,
  UseInterviewsDataResult,
} from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { isInterviewsFeatureDisabledError } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/utils"
import {
  getInterviewsErrorMessage,
  mapCompanyApplications,
  mapCompanyOffers,
} from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsData.helpers"

export function useInterviewsData({
  role,
  selectedOfferId,
}: UseInterviewsDataParams): UseInterviewsDataResult {
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
        toast.success("Interview slot confirmed.")
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Could not confirm this slot."))
      },
    }),
  )

  const proposeSlotsMutation = useMutation(
    orpc.interviews.proposeSlots.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: companyListQueryOptions.queryKey,
        })
        toast.success("Interview proposal sent.")
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Could not send interview proposal."))
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

  const proposeSlots = async (input: ProposeSlotsInput) => {
    const selectedApplicationId = input.applicationId.trim()
    if (selectedApplicationId.length === 0) {
      toast.error("Please select an application.")
      return false
    }

    const hasSelectedApplication = companyApplications.some(
      (application) => application.id === selectedApplicationId,
    )
    if (!hasSelectedApplication) {
      toast.error("Please select a valid application for this offer.")
      return false
    }

    const cleanedSlots = input.slots
      .map((slot) => ({
        startsAt: slot.startsAt.trim(),
        endsAt: slot.endsAt.trim(),
        location: slot.location.trim(),
        meetingUrl: slot.meetingUrl.trim(),
      }))
      .filter((slot) => slot.startsAt.length > 0 && slot.endsAt.length > 0)

    if (cleanedSlots.length === 0) {
      toast.error("Add at least one complete interview slot.")
      return false
    }

    try {
      await proposeSlotsMutation.mutateAsync({
        applicationId: selectedApplicationId,
        note: input.note.trim() || undefined,
        slots: cleanedSlots.map((slot) => ({
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          location: slot.location || undefined,
          meetingUrl: slot.meetingUrl || undefined,
        })),
      })
      return true
    } catch {
      return false
    }
  }

  const studentInterviews = (studentInterviewsQuery.data ?? []) as StudentInterviewView[]
  const companyInterviews = (companyInterviewsQuery.data ?? []) as CompanyInterviewView[]
  const studentErrorMessage = getInterviewsErrorMessage(studentInterviewsQuery.error)
  const companyErrorMessage = getInterviewsErrorMessage(companyInterviewsQuery.error)

  const isFeatureDisabled = [
    studentInterviewsQuery.error,
    companyInterviewsQuery.error,
    confirmSlotMutation.error,
    proposeSlotsMutation.error,
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
    isSubmittingProposal: proposeSlotsMutation.isPending,
    isFeatureDisabled,
    confirmSlot,
    proposeSlots,
  }
}
