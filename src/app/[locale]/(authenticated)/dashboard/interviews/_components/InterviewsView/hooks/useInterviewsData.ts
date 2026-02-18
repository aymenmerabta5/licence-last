"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/lib/error-message"
import { orpc } from "@/server/orpc/client"

import type {
  CompanyApplicationOption,
  CompanyInterviewView,
  CompanyOfferOption,
  ConfirmSlotInput,
  InterviewsRole,
  ProposeSlotsInput,
  StudentInterviewView,
} from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { isInterviewsFeatureDisabledError } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/utils"

interface UseInterviewsDataParams {
  role: InterviewsRole
  selectedOfferId: string
}

interface UseInterviewsDataResult {
  studentInterviews: StudentInterviewView[]
  companyInterviews: CompanyInterviewView[]
  companyOffers: CompanyOfferOption[]
  companyApplications: CompanyApplicationOption[]
  studentErrorMessage: string | null
  companyErrorMessage: string | null
  isStudentLoading: boolean
  isCompanyLoading: boolean
  isOffersLoading: boolean
  isApplicationsLoading: boolean
  confirmingSlotId: string | null
  isSubmittingProposal: boolean
  isFeatureDisabled: boolean
  confirmSlot: (input: ConfirmSlotInput) => Promise<void>
  proposeSlots: (input: ProposeSlotsInput) => Promise<boolean>
}

export function useInterviewsData({
  role,
  selectedOfferId,
}: UseInterviewsDataParams): UseInterviewsDataResult {
  const queryClient = useQueryClient()
  const [confirmingSlotId, setConfirmingSlotId] = useState<string | null>(null)

  const studentListQueryOptions = useMemo(
    () => orpc.interviews.listForStudent.queryOptions(),
    [],
  )
  const companyListQueryOptions = useMemo(
    () => orpc.interviews.listForCompany.queryOptions(),
    [],
  )

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
    if (input.applicationId.trim().length === 0) {
      toast.error("Please provide an application ID.")
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
        applicationId: input.applicationId.trim(),
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

  const studentInterviews = useMemo(
    () => (studentInterviewsQuery.data ?? []) as StudentInterviewView[],
    [studentInterviewsQuery.data],
  )
  const companyInterviews = useMemo(
    () => (companyInterviewsQuery.data ?? []) as CompanyInterviewView[],
    [companyInterviewsQuery.data],
  )
  const companyOffers = useMemo<CompanyOfferOption[]>(
    () =>
      (companyOffersQuery.data ?? []).map((offer) => ({
        id: offer.id,
        title: offer.title,
      })),
    [companyOffersQuery.data],
  )
  const companyApplications = useMemo<CompanyApplicationOption[]>(
    () =>
      (applicationsByOfferQuery.data?.applications ?? []).map((application) => ({
        id: application.id,
        studentName: application.student.name ?? "Unnamed student",
        pipelineStage: application.pipelineStage,
        createdAt: application.createdAt,
      })),
    [applicationsByOfferQuery.data],
  )

  const studentErrorMessage =
    studentInterviewsQuery.error &&
    !isInterviewsFeatureDisabledError(studentInterviewsQuery.error)
      ? getErrorMessage(studentInterviewsQuery.error, "Could not load interviews.")
      : null

  const companyErrorMessage =
    companyInterviewsQuery.error &&
    !isInterviewsFeatureDisabledError(companyInterviewsQuery.error)
      ? getErrorMessage(companyInterviewsQuery.error, "Could not load interviews.")
      : null

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
