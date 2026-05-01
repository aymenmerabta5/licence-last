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

  const withdrawMutation = useMutation({
    ...orpc.applications.withdraw.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["applications", "listByStudent"],
      })
      const previousData = queryClient.getQueryData([
        "applications",
        "listByStudent",
      ])
      queryClient.setQueryData(
        ["applications", "listByStudent"],
        (old) => {
          if (!old || typeof old !== "object" || !("pages" in old))
            return old
          const data = old as {
            pages: Array<{ applications: Array<{ id: string }> }>
            pageParams: unknown[]
          }
          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              applications: page.applications.filter(
                (app) => app.id !== variables.applicationId,
              ),
            })),
          }
        },
      )
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["applications", "listByStudent"],
          context.previousData,
        )
      }
      toast.error(t("withdrawError"))
      setWithdrawingId(null)
    },
    onSuccess: () => {
      toast.success(t("withdrawSuccess"))
      setWithdrawingId(null)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["applications", "listByStudent"],
      })
    },
  })

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
