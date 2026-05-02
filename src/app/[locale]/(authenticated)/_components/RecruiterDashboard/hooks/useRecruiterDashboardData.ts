"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { orpc, type orpcClient } from "@/server/orpc/client"

export type OfferWithSkills = Awaited<
  ReturnType<typeof orpcClient.offers.listByCompany>
>[number]
export type CompanyTrustIndex = Awaited<
  ReturnType<typeof orpcClient.companies.getTrustIndex>
>

interface RecruiterDashboardInitialData {
  offers?: OfferWithSkills[]
  trustData?: CompanyTrustIndex | null
}

export function useRecruiterDashboardData(
  initialData?: RecruiterDashboardInitialData,
) {
  const { data: offers = initialData?.offers ?? [], isLoading: isOffersLoading } =
    useQuery({
      ...orpc.offers.listByCompany.queryOptions(),
      enabled: initialData?.offers === undefined,
      initialData: initialData?.offers,
    })

  // Derive companyId from offers for trust index query
  const companyId = offers[0]?.companyId
  const trustQuery = useQuery({
    ...orpc.companies.getTrustIndex.queryOptions({
      input: { companyId: companyId ?? "" },
    }),
    enabled: !!companyId && initialData?.trustData === undefined,
    initialData: initialData?.trustData ?? undefined,
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
