"use client"

import { useState } from "react"
import type { InfiniteData } from "@tanstack/react-query"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { canTransitionStage } from "@/lib/constants/pipeline"
import type { PipelineStage } from "@/lib/constants/pipeline"
import { orpcClient } from "@/server/orpc/client"
import type { ListApplicationsByOfferResult } from "@/server/services/applications/list-by-offer"

interface UseCandidateStageMutationParams {
  applicationsQueryKey: readonly [string, string, string]
  applicationStageById: Map<string, PipelineStage>
}

interface StageMutationContext {
  previousData?: InfiniteData<ListApplicationsByOfferResult>
  applicationId: string
}

export function useCandidateStageMutation({
  applicationsQueryKey,
  applicationStageById,
}: UseCandidateStageMutationParams) {
  const t = useTranslations("dashboard.company.candidates")
  const queryClient = useQueryClient()
  const [pendingStageById, setPendingStageById] = useState<Record<string, true>>({})

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
          getOptimisticStageData(previousData, applicationId, toStage),
        )
      }

      return { previousData, applicationId } satisfies StageMutationContext
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(applicationsQueryKey, context.previousData)
      }
      toast.error(t("stageUpdateFailed"))
    },
    onSettled: (_data, _error, variables, context) => {
      const settledApplicationId = context?.applicationId ?? variables.applicationId
      setPendingStageById((prev) => removePendingStage(prev, settledApplicationId))
      queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
    },
  })

  const handleStageChange = (applicationId: string, toStage: PipelineStage) => {
    const fromStage = applicationStageById.get(applicationId)

    if (!fromStage || fromStage === toStage || pendingStageById[applicationId]) {
      return
    }
    if (!canTransitionStage(fromStage, toStage)) {
      toast.error(t("invalidStageTransition"))
      return
    }

    stageMutation.mutate({ applicationId, toStage })
  }

  return { pendingStageById, handleStageChange }
}

function getOptimisticStageData(
  previousData: InfiniteData<ListApplicationsByOfferResult>,
  applicationId: string,
  toStage: PipelineStage,
) {
  return {
    ...previousData,
    pages: previousData.pages.map((page) => ({
      ...page,
      applications: page.applications.map((application) =>
        application.id === applicationId
          ? { ...application, pipelineStage: toStage }
          : application,
      ),
    })),
  }
}

function removePendingStage(
  pendingStageById: Record<string, true>,
  applicationId: string,
) {
  if (!pendingStageById[applicationId]) {
    return pendingStageById
  }

  const nextPendingStageById = { ...pendingStageById }
  delete nextPendingStageById[applicationId]
  return nextPendingStageById
}
