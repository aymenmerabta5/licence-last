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
import { useInfiniteScroll } from "@/hooks"
import type { PipelineStage } from "@/lib/constants/pipeline"
import { STAGE_COLUMNS } from "@/lib/constants/pipeline"
import { orpc, orpcClient } from "@/server/orpc/client"

export function useApplications() {
  const t = useTranslations("dashboard.applications")
  const queryClient = useQueryClient()

  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)
  const [openedTimelineFor, setOpenedTimelineFor] = useState<string | null>(
    null,
  )

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["applications", "listByStudent"],
      queryFn: async ({ pageParam }) =>
        orpcClient.applications.listByStudent({
          cursor: pageParam as { createdAt: string; id: string } | undefined,
          limit: 30,
        }),
      initialPageParam: undefined as
        | { createdAt: string; id: string }
        | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

  const timelineQuery = useQuery({
    ...orpc.applications.getTimeline.queryOptions({
      input: { applicationId: openedTimelineFor ?? "" },
    }),
    enabled: !!openedTimelineFor,
  })

  const applications = useMemo(
    () => data?.pages.flatMap((p) => p.applications) ?? [],
    [data],
  )

  const withdrawMutation = useMutation(
    orpc.applications.withdraw.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["applications", "listByStudent"],
        })
        toast.success(t("withdrawSuccess"))
        setWithdrawingId(null)
      },
      onError: () => {
        toast.error(t("withdrawError"))
        setWithdrawingId(null)
      },
    }),
  )

  const handleWithdraw = (applicationId: string, confirmMessage: string) => {
    if (!window.confirm(confirmMessage)) return
    setWithdrawingId(applicationId)
    withdrawMutation.mutate({ applicationId })
  }

  const groupedByStage = useMemo(() => {
    const groups = new Map<PipelineStage, typeof applications>()
    for (const stage of STAGE_COLUMNS) groups.set(stage, [])
    for (const app of applications) {
      const stage = (app.pipelineStage ?? "applied") as PipelineStage
      groups.get(stage)?.push(app)
    }
    return groups
  }, [applications])

  const sentinelRef = useInfiniteScroll(
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  )

  return {
    applications,
    isLoading,
    isFetchingNextPage,
    groupedByStage,
    sentinelRef,
    withdrawingId,
    handleWithdraw,
    openedTimelineFor,
    setOpenedTimelineFor,
    timelineData: timelineQuery.data ?? [],
    isTimelineLoading: timelineQuery.isLoading,
  }
}
