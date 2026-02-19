"use client"

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useCandidateStageMutation } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/hooks/useCandidateStageMutation"
import type {
  AcceptModalState,
  RefuseModalState,
} from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/types"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import type { PipelineStage } from "@/lib/constants/pipeline"
import { STAGE_COLUMNS } from "@/lib/constants/pipeline"
import { orpc, orpcClient } from "@/server/orpc/client"
import type { ListApplicationsByOfferResult } from "@/server/services/applications/list-by-offer"

export function useCandidates(offerId: string) {
  const t = useTranslations("dashboard.company.candidates")
  const queryClient = useQueryClient()

  const [actionLoading, setActionLoading] = useState<string | null>(null)
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
    initialPageParam: undefined as
      | { createdAt: string; id: string }
      | undefined,
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
  const { pendingStageById, handleStageChange } = useCandidateStageMutation({
    applicationsQueryKey,
    applicationStageById,
  })

  const timelineQuery = useQuery({
    ...orpc.applications.getTimeline.queryOptions({
      input: { applicationId: openedTimelineFor ?? "" },
    }),
    enabled: !!openedTimelineFor,
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
      await acceptMutation.mutateAsync({
        applicationId: acceptModal.applicationId,
      })
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
