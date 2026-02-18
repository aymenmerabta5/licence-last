"use client"

import { useMemo, useState } from "react"
import type { InfiniteData } from "@tanstack/react-query"
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { useInfiniteScroll } from "@/hooks"
import { STAGE_COLUMNS, canTransitionStage } from "@/lib/constants/pipeline"
import type { PipelineStage } from "@/lib/constants/pipeline"
import { orpc, orpcClient } from "@/server/orpc/client"
import type { ListApplicationsByOfferResult } from "@/server/services/applications/list-by-offer"

import type { AcceptModalState, RefuseModalState } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/types"

export function useCandidates(offerId: string) {
  const t = useTranslations("dashboard.company.candidates")
  const queryClient = useQueryClient()

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [pendingStageById, setPendingStageById] = useState<
    Record<string, true>
  >({})
  const [acceptModal, setAcceptModal] = useState<AcceptModalState | null>(null)
  const [refuseModal, setRefuseModal] = useState<RefuseModalState | null>(null)
  const [refuseNote, setRefuseNote] = useState("")
  const [openedTimelineFor, setOpenedTimelineFor] = useState<string | null>(
    null,
  )
  const applicationsQueryKey = ["applications", "listByOffer", offerId] as const

  const { data: offer, isLoading: offerLoading } = useQuery({
    ...orpc.offers.getById.queryOptions({ input: { offerId } }),
    enabled: !!offerId,
  })

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
        cursor: pageParam as { createdAt: string; id: string } | undefined,
        limit: 24,
      }),
    enabled: !!offerId,
    initialPageParam:
      undefined as { createdAt: string; id: string } | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const applications = useMemo(
    () => data?.pages.flatMap((page) => page.applications) ?? [],
    [data],
  )
  const applicationStageById = useMemo(
    () =>
      new Map(
        applications.map((app) => [app.id, app.pipelineStage as PipelineStage]),
      ),
    [applications],
  )

  const timelineQuery = useQuery({
    ...orpc.applications.getTimeline.queryOptions({
      input: { applicationId: openedTimelineFor ?? "" },
    }),
    enabled: !!openedTimelineFor,
  })

  const stageMutation = useMutation({
    mutationFn: ({
      applicationId,
      toStage,
    }: {
      applicationId: string
      toStage: PipelineStage
    }) => orpcClient.applications.updatePipelineStage({ applicationId, toStage }),
    onMutate: async ({ applicationId, toStage }) => {
      setPendingStageById((prev) => ({ ...prev, [applicationId]: true }))
      await queryClient.cancelQueries({ queryKey: applicationsQueryKey })

      const previousData =
        queryClient.getQueryData<InfiniteData<ListApplicationsByOfferResult>>(
          applicationsQueryKey,
        )

      if (previousData) {
        queryClient.setQueryData<InfiniteData<ListApplicationsByOfferResult>>(
          applicationsQueryKey,
          {
            ...previousData,
            pages: previousData.pages.map((page) => ({
              ...page,
              applications: page.applications.map((app) =>
                app.id === applicationId
                  ? { ...app, pipelineStage: toStage }
                  : app,
              ),
            })),
          },
        )
      }

      return { previousData, applicationId }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(applicationsQueryKey, context.previousData)
      }
      toast.error(t("stageUpdateFailed"))
    },
    onSettled: (_data, _error, variables, context) => {
      const settledApplicationId = context?.applicationId ?? variables.applicationId

      setPendingStageById((prev) => {
        if (!prev[settledApplicationId]) return prev
        const next = { ...prev }
        delete next[settledApplicationId]
        return next
      })

      queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
    },
  })

  const acceptMutation = useMutation(
    orpc.applications.companyAccept.mutationOptions(),
  )

  const refuseMutation = useMutation(
    orpc.applications.companyRefuse.mutationOptions(),
  )

  const handleAccept = async () => {
    if (!acceptModal) return
    setActionLoading(acceptModal.applicationId)
    try {
      await acceptMutation.mutateAsync({ applicationId: acceptModal.applicationId })
      await queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] })
      setAcceptModal(null)
      toast.success(t("acceptSuccess"))
    } catch {
      toast.error(t("acceptError"))
    } finally {
      setActionLoading(null)
    }
  }

  const handleRefuse = async () => {
    if (!refuseModal) return
    setActionLoading(refuseModal.applicationId)
    try {
      await refuseMutation.mutateAsync({
        applicationId: refuseModal.applicationId,
        note: refuseNote || undefined,
      })
      await queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] })
      setRefuseModal(null)
      setRefuseNote("")
      toast.success(t("refuseSuccess"))
    } catch {
      toast.error(t("refuseError"))
    } finally {
      setActionLoading(null)
    }
  }

  const handleStageChange = (applicationId: string, toStage: PipelineStage) => {
    const fromStage = applicationStageById.get(applicationId)

    if (!fromStage || fromStage === toStage) return
    if (pendingStageById[applicationId]) return

    if (!canTransitionStage(fromStage, toStage)) {
      toast.error(t("invalidStageTransition"))
      return
    }

    stageMutation.mutate({ applicationId, toStage })
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

  return {
    offer,
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
    handleStageChange,
    pendingStageById,
    openedTimelineFor,
    setOpenedTimelineFor,
    timelineData: timelineQuery.data ?? [],
    isTimelineLoading: timelineQuery.isLoading,
  }
}
