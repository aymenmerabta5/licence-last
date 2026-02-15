"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { orpc } from "@/server/orpc/client"

export function useRecruiterDashboardData() {
  const { data: offers = [], isLoading: isOffersLoading } = useQuery(
    orpc.offers.listByCompany.queryOptions(),
  )

  // Derive companyId from offers for trust index query
  const companyId = offers[0]?.companyId
  const trustQuery = useQuery({
    ...orpc.companies.getTrustIndex.queryOptions({
      input: { companyId: companyId ?? "" },
    }),
    enabled: !!companyId,
  })

  const offerStats = useMemo(() => {
    const published = offers.filter((o) => o.status === "published")
    const drafts = offers.filter((o) => o.status === "draft")
    const closed = offers.filter((o) => o.status === "closed")
    const totalCandidates = offers.reduce(
      (sum, o) => sum + (o.candidatesCount ?? 0),
      0,
    )
    const activeCandidates = published.reduce(
      (sum, o) => sum + (o.candidatesCount ?? 0),
      0,
    )

    return {
      activeOffers: published.length,
      draftOffers: drafts.length,
      closedOffers: closed.length,
      totalOffers: offers.length,
      totalCandidates,
      activeCandidates,
      recentOffers: offers.slice(0, 4),
    }
  }, [offers])

  return {
    ...offerStats,
    trustData: trustQuery.data ?? null,
    isTrustLoading: trustQuery.isLoading && !!companyId,
    isLoading: isOffersLoading,
  }
}
