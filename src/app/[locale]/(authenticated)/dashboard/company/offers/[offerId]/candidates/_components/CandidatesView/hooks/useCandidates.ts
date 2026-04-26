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
  CandidateFiltersState,
  RefuseModalState,
} from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/types"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import type { LanguageCode } from "@/lib/constants/languages"
import type { PipelineStage } from "@/lib/constants/pipeline"
import { STAGE_COLUMNS } from "@/lib/constants/pipeline"
import { orpc, orpcClient } from "@/server/orpc/client"
import type { ListApplicationsByOfferResult } from "@/server/services/applications/list-by-offer"

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
  const { pendingStageById, handleStageChange } = useCandidateStageMutation({
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
      await refreshTimelineForApplication(acceptModal.applicationId)
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
      await refreshTimelineForApplication(refuseModal.applicationId)
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
