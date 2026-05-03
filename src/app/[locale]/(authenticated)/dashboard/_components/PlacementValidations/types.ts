import type { RefObject } from "react"
import type { InferRouterOutputs } from "@orpc/server"
import type { AppRouter } from "@/server/orpc/router"

type ListPendingApplicationsResult =
  InferRouterOutputs<AppRouter>["placements"]["listPending"]
type PendingApplication = ListPendingApplicationsResult["applications"][number]

export type PlacementValidationRole = "admin" | "department_head"

export interface ValidationSummary {
  summaryBullets: string[]
  checklist: string[]
  potentialInconsistencies: string[]
}

export type ValidationListItem = PendingApplication
export type ValidationDetailData = PendingApplication

export interface ValidationRouteConfig {
  backHref: string
  detailHref: (applicationId: string) => string
}

export interface ValidationCopyConfig {
  listNamespace: string
  detailNamespace: string
}

export interface ValidationListPageProps {
  applications: ValidationListItem[]
  isLoading: boolean
  isFetchingNextPage: boolean
  sentinelRef: RefObject<HTMLDivElement | null>
  backHref: string
  backLabel: string
  title: string
  description: string
  emptyLabel: string
  detailHref: (applicationId: string) => string
  listNamespace: string
  maxWidthClass?: string
}

export interface ValidationHeaderProps {
  isLoading: boolean
  hasApplication: boolean
  studentName?: string | null
  companyName?: string | null
  backHref: string
  backLabel: string
  title: string
  notFoundLabel: string
}
