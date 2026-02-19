import type { getTranslations } from "next-intl/server"

import type { listOffersByCompany } from "@/server/services/offers/list-by-company"

export type CandidatesDashboardTranslations = Awaited<
  ReturnType<typeof getTranslations>
>

export type CandidatesDashboardOffer = Awaited<
  ReturnType<typeof listOffersByCompany>
>[number]
