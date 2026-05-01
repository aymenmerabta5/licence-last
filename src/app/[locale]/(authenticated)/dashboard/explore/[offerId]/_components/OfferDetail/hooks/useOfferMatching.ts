"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"

import { orpc } from "@/server/orpc/client"

export function useOfferMatching(
  studentUserId: string,
  offerId: string,
  companyId: string,
) {
  const hasCapturedRef = useRef(false)
  const queryClient = useQueryClient()

  const matchScoreQueryOptions = orpc.matching.getScore.queryOptions({
    input: { studentUserId, offerId },
  })

  const skillGapQueryOptions = orpc.matching.getSkillGap.queryOptions({
    input: { studentUserId, offerId },
  })

  const readinessHistoryQueryOptions =
    orpc.matching.getReadinessHistory.queryOptions({
      input: { studentUserId, offerId, limit: 6 },
    })

  const trustIndexQueryOptions = orpc.companies.getTrustIndex.queryOptions({
    input: { companyId },
  })

  const matchScoreQuery = useQuery(matchScoreQueryOptions)

  const skillGapQuery = useQuery(skillGapQueryOptions)

  const readinessHistoryQuery = useQuery(readinessHistoryQueryOptions)

  const trustIndexQuery = useQuery(trustIndexQueryOptions)

  const captureSnapshotMutation = useMutation({
    ...orpc.matching.captureReadinessSnapshot.mutationOptions(),
    onMutate: async (variables) => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: readinessHistoryQueryOptions.queryKey,
        }),
        queryClient.cancelQueries({
          queryKey: matchScoreQueryOptions.queryKey,
        }),
      ])

      const previousReadinessHistory = queryClient.getQueryData(
        readinessHistoryQueryOptions.queryKey,
      )
      const previousMatchScore = queryClient.getQueryData(
        matchScoreQueryOptions.queryKey,
      )

      const skillGap = skillGapQuery.data
      if (skillGap) {
        queryClient.setQueryData(
          readinessHistoryQueryOptions.queryKey,
          (old) => {
            if (!old) return old
            return {
              ...old,
              points: [
                {
                  id: crypto.randomUUID(),
                  readyPercent: skillGap.readyPercent,
                  missingSkillsCount: skillGap.missingSkills.length,
                  capturedAt: new Date(),
                  source: variables.source as string,
                } as (typeof old.points)[number],
                ...old.points,
              ],
            }
          },
        )
      }

      return { previousReadinessHistory, previousMatchScore }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousReadinessHistory) {
        queryClient.setQueryData(
          readinessHistoryQueryOptions.queryKey,
          context.previousReadinessHistory,
        )
      }
      if (context?.previousMatchScore) {
        queryClient.setQueryData(
          matchScoreQueryOptions.queryKey,
          context.previousMatchScore,
        )
      }
    },
    onSettled: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: readinessHistoryQueryOptions.queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: matchScoreQueryOptions.queryKey,
        }),
      ])
    },
  })

  const captureSnapshotMutateRef = useRef(captureSnapshotMutation.mutate)
  captureSnapshotMutateRef.current = captureSnapshotMutation.mutate

  useEffect(() => {
    if (!hasCapturedRef.current && !captureSnapshotMutation.isPending) {
      hasCapturedRef.current = true
      captureSnapshotMutateRef.current({ offerId, source: "offer_view" })
    }
  }, [captureSnapshotMutation.isPending, offerId])

  const readinessPoints = readinessHistoryQuery.data?.points ?? []
  const latestReadiness = readinessPoints[0]?.readyPercent
  const previousReadiness = readinessPoints[1]?.readyPercent
  const readinessDelta =
    typeof latestReadiness === "number" && typeof previousReadiness === "number"
      ? latestReadiness - previousReadiness
      : null

  return {
    matchScoreQuery,
    skillGapQuery,
    trustIndexQuery,
    latestReadiness,
    readinessDelta,
  }
}
