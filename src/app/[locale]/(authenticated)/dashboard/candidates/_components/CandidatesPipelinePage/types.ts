import type { getTranslations } from "next-intl/server"

import type { InferRouterOutputs } from "@orpc/server"
import type { AppRouter } from "@/server/orpc/router"

type ListOffersByCompanyResult =
  InferRouterOutputs<AppRouter>["offers"]["listByCompany"]

export type CandidatesDashboardTranslations = Awaited<
  ReturnType<typeof getTranslations>
>

export type CandidatesDashboardOffer = ListOffersByCompanyResult[number]
