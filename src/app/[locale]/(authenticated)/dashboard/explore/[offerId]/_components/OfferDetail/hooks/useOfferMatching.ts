"use client"

import { useEffect, useRef } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"

import { orpc } from "@/server/orpc/client"

export function useOfferMatching(studentUserId: string, offerId: string, companyId: string) {
  const hasCapturedRef = useRef(false)

  const matchScoreQuery = useQuery(
    orpc.matching.getScore.queryOptions({
      input: { studentUserId, offerId },
    }),
  )

  const skillGapQuery = useQuery(
    orpc.matching.getSkillGap.queryOptions({
      input: { studentUserId, offerId },
    }),
  )

  const readinessHistoryQuery = useQuery(
    orpc.matching.getReadinessHistory.queryOptions({
      input: { studentUserId, offerId, limit: 6 },
    }),
  )

  const trustIndexQuery = useQuery(
    orpc.companies.getTrustIndex.queryOptions({
      input: { companyId },
    }),
  )

  const captureSnapshotMutation = useMutation(
    orpc.matching.captureReadinessSnapshot.mutationOptions(),
  )

  useEffect(() => {
    if (!hasCapturedRef.current && !captureSnapshotMutation.isPending) {
      hasCapturedRef.current = true
      captureSnapshotMutation.mutate({ offerId, source: "offer_view" })
    }
  }, [captureSnapshotMutation, offerId])

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
