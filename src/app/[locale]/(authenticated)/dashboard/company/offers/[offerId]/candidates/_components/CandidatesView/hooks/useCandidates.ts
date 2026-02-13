"use client"

import { useState } from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { orpc, orpcClient } from "@/server/orpc/client"
import { useInfiniteScroll } from "@/hooks"
import { STAGE_COLUMNS } from "@/lib/constants/pipeline"
import type { PipelineStage } from "@/lib/constants/pipeline"
import type { ListApplicationsByOfferResult } from "@/server/services/applications/list-by-offer"
import type { RefuseModalState } from "../types"

export function useCandidates(offerId: string) {
  const queryClient = useQueryClient()

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [refuseModal, setRefuseModal] = useState<RefuseModalState | null>(null)
  const [refuseNote, setRefuseNote] = useState("")
  const [openedTimelineFor, setOpenedTimelineFor] = useState<string | null>(null)

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
    queryKey: ["applications", "listByOffer", offerId],
    queryFn: async ({ pageParam }) =>
      orpcClient.applications.listByOffer({
        offerId,
        cursor: pageParam as { createdAt: string; id: string } | undefined,
        limit: 24,
      }),
    enabled: !!offerId,
    initialPageParam: undefined as { createdAt: string; id: string } | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const applications = data?.pages.flatMap((page) => page.applications) ?? []

  const timelineQuery = useQuery({
    ...orpc.applications.getTimeline.queryOptions({
      input: { applicationId: openedTimelineFor ?? "" },
    }),
    enabled: !!openedTimelineFor,
  })

  const invalidateKey = ["applications", "listByOffer", offerId]

  const stageMutation = useMutation(
    orpc.applications.updatePipelineStage.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: invalidateKey })
      },
    }),
  )

  const acceptMutation = useMutation(
    orpc.applications.companyAccept.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: invalidateKey })
        queryClient.invalidateQueries({ queryKey: ["notifications", "list"] })
        setActionLoading(null)
      },
      onError: () => setActionLoading(null),
    }),
  )

  const refuseMutation = useMutation(
    orpc.applications.companyRefuse.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: invalidateKey })
        queryClient.invalidateQueries({ queryKey: ["notifications", "list"] })
        setActionLoading(null)
        setRefuseModal(null)
        setRefuseNote("")
      },
      onError: () => setActionLoading(null),
    }),
  )

  const handleAccept = (applicationId: string, confirmMessage: string) => {
    if (!window.confirm(confirmMessage)) return
    setActionLoading(applicationId)
    acceptMutation.mutate({ applicationId })
  }

  const handleRefuse = () => {
    if (!refuseModal) return
    setActionLoading(refuseModal.applicationId)
    refuseMutation.mutate({
      applicationId: refuseModal.applicationId,
      note: refuseNote || undefined,
    })
  }

  const handleStageChange = (applicationId: string, toStage: PipelineStage) => {
    stageMutation.mutate({ applicationId, toStage })
  }

  const grouped = new Map<PipelineStage, typeof applications>()
  for (const stage of STAGE_COLUMNS) grouped.set(stage, [])
  for (const app of applications) {
    const stage = (app.pipelineStage ?? "applied") as PipelineStage
    grouped.get(stage)?.push(app)
  }

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage)

  return {
    offer,
    applications,
    isLoading: offerLoading || applicationsLoading || !offerId,
    isFetchingNextPage,
    grouped,
    sentinelRef,
    actionLoading,
    handleAccept,
    refuseModal,
    setRefuseModal,
    refuseNote,
    setRefuseNote,
    handleRefuse,
    handleStageChange,
    isStagePending: stageMutation.isPending,
    openedTimelineFor,
    setOpenedTimelineFor,
    timelineData: timelineQuery.data ?? [],
    isTimelineLoading: timelineQuery.isLoading,
  }
}
