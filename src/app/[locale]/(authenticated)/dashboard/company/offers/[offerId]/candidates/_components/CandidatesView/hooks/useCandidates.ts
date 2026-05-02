"use client"

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useCandidateStageMutation } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/hooks/useCandidateStageMutation"
import type {
  AcceptModalState,
  CandidateFiltersState,
  RefuseModalState,
} from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/types"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import type { LanguageCode } from "@/lib/constants/languages"
import type { PipelineStage } from "@/lib/constants/pipeline"
import { STAGE_COLUMNS } from "@/lib/constants/pipeline"
import type { InferRouterOutputs } from "@orpc/server"
import { orpc, orpcClient } from "@/server/orpc/client"
import type { AppRouter } from "@/server/orpc/router"

type ListApplicationsByOfferResult = InferRouterOutputs<
  AppRouter
>["applications"]["listByOffer"]

const EMPTY_FILTERS: CandidateFiltersState = {
  skillTagIds: [],
  languageCodes: [],
}

export function useCandidates(offerId: string) {
  const t = useTranslations("dashboard.company.candidates")
  const queryClient = useQueryClient()

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [acceptModal, setAcceptModal] = useState<AcceptModalState | null>(null)
  const [refuseModal, setRefuseModal] = useState<RefuseModalState | null>(null)
  const [interviewModal, setInterviewModal] = useState<{
    applicationId: string
    studentName: string
    offerTitle: string
  } | null>(null)
  const [isProposingInterview, setIsProposingInterview] = useState(false)
  const [refuseNote, setRefuseNote] = useState("")
  const [filters, setFilters] = useState<CandidateFiltersState>(EMPTY_FILTERS)
  const [openedTimelineFor, setOpenedTimelineFor] = useState<string | null>(
    null,
  )
  const applicationsQueryKey = useMemo(
    () => ["applications", "listByOffer", offerId, filters] as const,
    [offerId, filters],
  )

  const refreshTimelineForApplication = async (applicationId: string) => {
    if (openedTimelineFor !== applicationId) return

    const timelineQueryKey = orpc.applications.getTimeline.queryOptions({
      input: { applicationId },
    }).queryKey

    await queryClient.invalidateQueries({
      queryKey: timelineQueryKey,
      refetchType: "active",
    })
  }

  const { data: offer, isLoading: offerLoading } = useQuery({
    ...orpc.offers.getById.queryOptions({ input: { offerId } }),
    enabled: !!offerId,
  })
  const { data: skillsResult } = useQuery(orpc.skills.list.queryOptions())

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: applicationsLoading,
  } = useInfiniteQuery<ListApplicationsByOfferResult>({
    queryKey: applicationsQueryKey,
    queryFn: async ({ pageParam }) =>
      orpcClient.applications.listByOffer({
        offerId,
        skillTagIds:
          filters.skillTagIds.length > 0 ? filters.skillTagIds : undefined,
        languageCodes:
          filters.languageCodes.length > 0
            ? (filters.languageCodes as LanguageCode[])
            : undefined,
        cursor: pageParam as { createdAt: string; id: string } | undefined,
        limit: 24,
      }),
    enabled: !!offerId,
    initialPageParam: undefined as
      | { createdAt: string; id: string }
      | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const applications = useMemo(
    () => data?.pages.flatMap((page) => page.applications) ?? [],
    [data],
  )
  const availableSkills = useMemo(
    () => skillsResult?.skills ?? [],
    [skillsResult?.skills],
  )
  const applicationStageById = useMemo(
    () =>
      new Map(
        applications.map((app) => [app.id, app.pipelineStage as PipelineStage]),
      ),
    [applications],
  )
  const { pendingStageById, handleStageChange: doStageChange } =
    useCandidateStageMutation({
      applicationsQueryKey,
      applicationStageById,
      onStageSettled: refreshTimelineForApplication,
    })

  const timelineQuery = useQuery({
    ...orpc.applications.getTimeline.queryOptions({
      input: { applicationId: openedTimelineFor ?? "" },
    }),
    enabled: !!openedTimelineFor,
  })

  const acceptMutation = useMutation({
    ...orpc.applications.companyAccept.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: applicationsQueryKey })
      const previousData =
        queryClient.getQueryData<InfiniteData<ListApplicationsByOfferResult>>(
          applicationsQueryKey,
        )
      if (previousData) {
        queryClient.setQueryData<InfiniteData<ListApplicationsByOfferResult>>(
          applicationsQueryKey,
          (old) => {
            if (!old) return old
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                applications: page.applications.map((app) =>
                  app.id === variables.applicationId
                    ? { ...app, status: "company_accepted", pipelineStage: "accepted" }
                    : app,
                ),
              })),
            }
          },
        )
      }
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(applicationsQueryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
    },
  })

  const refuseMutation = useMutation({
    ...orpc.applications.companyRefuse.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: applicationsQueryKey })
      const previousData =
        queryClient.getQueryData<InfiniteData<ListApplicationsByOfferResult>>(
          applicationsQueryKey,
        )
      if (previousData) {
        queryClient.setQueryData<InfiniteData<ListApplicationsByOfferResult>>(
          applicationsQueryKey,
          (old) => {
            if (!old) return old
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                applications: page.applications.map((app) =>
                  app.id === variables.applicationId
                    ? {
                        ...app,
                        status: "company_refused",
                        pipelineStage: "rejected",
                        companyNote: variables.note ?? null,
                      }
                    : app,
                ),
              })),
            }
          },
        )
      }
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(applicationsQueryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
    },
  })

  const proposeSlotsMutation = useMutation({
    ...orpc.interviews.proposeSlots.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: applicationsQueryKey })
      const previousData =
        queryClient.getQueryData<InfiniteData<ListApplicationsByOfferResult>>(
          applicationsQueryKey,
        )
      if (previousData) {
        queryClient.setQueryData<InfiniteData<ListApplicationsByOfferResult>>(
          applicationsQueryKey,
          (old) => {
            if (!old) return old
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                applications: page.applications.map((app) =>
                  app.id === variables.applicationId
                    ? { ...app, pipelineStage: "interview" }
                    : app,
                ),
              })),
            }
          },
        )
      }
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(applicationsQueryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
    },
  })

  const handleAccept = () => {
    if (!acceptModal) return
    const { applicationId } = acceptModal
    setActionLoading(applicationId)
    setAcceptModal(null)
    acceptMutation.mutate(
      { applicationId },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
          await refreshTimelineForApplication(applicationId)
          queryClient.invalidateQueries({ queryKey: ["notifications", "list"] })
          toast.success(t("acceptSuccess"))
        },
        onError: () => {
          toast.error(t("acceptError"))
        },
        onSettled: () => {
          setActionLoading(null)
        },
      },
    )
  }

  const handleRefuse = () => {
    if (!refuseModal) return
    const { applicationId } = refuseModal
    setActionLoading(applicationId)
    setRefuseModal(null)
    setRefuseNote("")
    refuseMutation.mutate(
      { applicationId, note: refuseNote || undefined },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
          await refreshTimelineForApplication(applicationId)
          queryClient.invalidateQueries({ queryKey: ["notifications", "list"] })
          toast.success(t("refuseSuccess"))
        },
        onError: () => {
          toast.error(t("refuseError"))
        },
        onSettled: () => {
          setActionLoading(null)
        },
      },
    )
  }

  const handleProposeInterview = async (payload: {
    applicationId: string
    note?: string
    slots: Array<{
      startsAt: string
      endsAt: string
      location?: string
      meetingUrl?: string
    }>
  }) => {
    setIsProposingInterview(true)
    setActionLoading(payload.applicationId)
    setInterviewModal(null)

    proposeSlotsMutation.mutate(
      {
        applicationId: payload.applicationId,
        slots: payload.slots,
        note: payload.note,
      },
      {
        onSuccess: async () => {
          await orpcClient.applications.updatePipelineStage({
            applicationId: payload.applicationId,
            toStage: "interview",
          })

          await queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
          await refreshTimelineForApplication(payload.applicationId)
          queryClient.invalidateQueries({ queryKey: ["notifications", "list"] })
          queryClient.invalidateQueries({
            queryKey: orpc.interviews.listForCompany.queryOptions().queryKey,
          })

          toast.success(t("interviewProposeSuccess"))
        },
        onError: () => {
          toast.error(t("interviewProposeError"))
        },
        onSettled: () => {
          setIsProposingInterview(false)
          setActionLoading(null)
        },
      },
    )
  }

  const handleStageChange = (
    applicationId: string,
    toStage: PipelineStage,
  ) => {
    const app = applications.find((a) => a.id === applicationId)

    if (toStage === "accepted") {
      if (app) {
        setAcceptModal({
          applicationId,
          studentName: app.student.name || "Student",
        })
      }
      return
    }
    if (toStage === "rejected") {
      if (app) {
        setRefuseModal({
          applicationId,
          studentName: app.student.name || "Student",
        })
      }
      return
    }
    if (toStage === "interview") {
      if (app && !app.interviewPreview) {
        setInterviewModal({
          applicationId,
          studentName: app.student.name || "Student",
          offerTitle: offer?.title || "",
        })
        return
      }
    }
    doStageChange(applicationId, toStage)
  }

  const grouped = useMemo(() => {
    const buckets = new Map<PipelineStage, typeof applications>()
    for (const stage of STAGE_COLUMNS) buckets.set(stage, [])
    for (const app of applications) {
      const stage = (app.pipelineStage ?? "applied") as PipelineStage
      buckets.get(stage)?.push(app)
    }
    return buckets
  }, [applications])

  const sentinelRef = useInfiniteScroll(
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  )

  const hasActiveFilters =
    filters.skillTagIds.length > 0 || filters.languageCodes.length > 0

  function toggleSkill(skillTagId: string) {
    setFilters((current) => ({
      ...current,
      skillTagIds: current.skillTagIds.includes(skillTagId)
        ? current.skillTagIds.filter((id) => id !== skillTagId)
        : [...current.skillTagIds, skillTagId],
    }))
  }

  function toggleLanguage(languageCode: string) {
    setFilters((current) => ({
      ...current,
      languageCodes: current.languageCodes.includes(languageCode)
        ? current.languageCodes.filter((code) => code !== languageCode)
        : [...current.languageCodes, languageCode],
    }))
  }

  return {
    offer,
    availableSkills,
    applications,
    isLoading: offerLoading || applicationsLoading || !offerId,
    isFetchingNextPage,
    grouped,
    sentinelRef,
    actionLoading,
    acceptModal,
    setAcceptModal,
    handleAccept,
    refuseModal,
    setRefuseModal,
    refuseNote,
    setRefuseNote,
    handleRefuse,
    interviewModal,
    setInterviewModal,
    isProposingInterview,
    handleProposeInterview,
    handleStageChange,
    pendingStageById,
    openedTimelineFor,
    setOpenedTimelineFor,
    timelineData: timelineQuery.data ?? [],
    isTimelineLoading: timelineQuery.isLoading,
    filters,
    hasActiveFilters,
    toggleSkill,
    toggleLanguage,
    clearFilters: () => setFilters(EMPTY_FILTERS),
  }
}
