import "server-only"

import { type ToolSet, tool } from "ai"
import { z } from "zod"
import { fuzzyMatchOffer, redactForAssistant } from "@/server/ai/tools/utils"
import type { ToolAuthContext } from "@/server/ai/types"
import { listApplicationsByOffer } from "@/server/services/applications/list-by-offer"
import {
  getCompanyTrustIndex,
  listCompanyTrustIndices,
} from "@/server/services/companies/trust-index"
// Service imports
import { listOffersByCompany } from "@/server/services/offers/list-by-company"
import { listPendingApplications } from "@/server/services/placements/list-pending"
import { getAdminStats } from "@/server/services/stats/get-admin-stats"
import { getUniversityDashboardStats } from "@/server/services/stats/get-university-dashboard-stats"

const MAX_OFFERS = 20
const MAX_CANDIDATES = 20
const MAX_PENDING = 20
const MAX_TRUST_LIST = 20

/**
 * Creates data-retrieval tools based on the user's role.
 * The LLM only sees tools it's authorized to use.
 */
export function createDataRetrievalTools(authCtx: ToolAuthContext): ToolSet {
  const tools: ToolSet = {}

  // ── Company Admin tools ──────────────────────────────────────────
  if (authCtx.role === "company_admin" && authCtx.companyId) {
    const companyId = authCtx.companyId

    tools.get_company_offers = tool({
      description:
        "Get the company's internship offers with status, candidate counts, and skills. " +
        "Use this when the user asks about their offers, how offers are performing, or wants an overview.",
      inputSchema: z.object({
        status: z
          .enum(["draft", "published", "closed"])
          .optional()
          .describe("Filter by offer status. Omit to get all offers."),
      }),
      execute: async ({ status }) => {
        try {
          let offers = await listOffersByCompany(companyId)

          if (status) {
            offers = offers.filter((o) => o.status === status)
          }

          const limited = offers.slice(0, MAX_OFFERS)
          const redacted = redactForAssistant(limited)

          return {
            totalOffers: offers.length,
            showing: limited.length,
            offers: redacted,
          }
        } catch {
          return { error: "Failed to retrieve offers. Please try again." }
        }
      },
    })

    tools.get_offer_candidates = tool({
      description:
        "Get candidates who applied to a specific offer, with pipeline stage distribution. " +
        "Use this when the user asks about applicants for a particular offer.",
      inputSchema: z.object({
        offerTitle: z
          .string()
          .describe(
            "The title (or partial title) of the offer to look up candidates for.",
          ),
      }),
      execute: async ({ offerTitle }) => {
        try {
          // First get all offers to resolve title → offerId
          const offers = await listOffersByCompany(companyId)
          const matched = fuzzyMatchOffer(offers, offerTitle)

          if (!matched) {
            const availableTitles = offers.map((o) => o.title)
            return {
              error: "Could not find an offer matching that title.",
              availableOffers: availableTitles.slice(0, 10),
            }
          }

          const result = await listApplicationsByOffer(matched.id, companyId, {
            limit: MAX_CANDIDATES,
          })

          // Compute pipeline stage distribution
          const stageDistribution: Record<string, number> = {}
          for (const app of result.applications) {
            stageDistribution[app.pipelineStage] =
              (stageDistribution[app.pipelineStage] ?? 0) + 1
          }

          const redacted = redactForAssistant(result.applications)

          return {
            offerTitle: matched.title,
            offerStatus: matched.status,
            totalCandidates: matched.candidatesCount,
            showing: result.applications.length,
            hasMore: result.hasMore,
            stageDistribution,
            candidates: redacted,
          }
        } catch {
          return { error: "Failed to retrieve candidates. Please try again." }
        }
      },
    })

    tools.get_company_trust_index = tool({
      description:
        "Get the company's trust score, tier, and factor breakdown. " +
        "Use this when the user asks about their trust rating, reputation, or score.",
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const trust = await getCompanyTrustIndex(companyId)
          return redactForAssistant(trust)
        } catch {
          return { error: "Failed to retrieve trust index. Please try again." }
        }
      },
    })
  }

  // ── Admin tools (university_admin, super_admin) ────────
  const hasUniversityWideStatsAccess =
    authCtx.role === "super_admin" ||
    (authCtx.role === "university_admin" &&
      authCtx.universityMembershipRole !== "department_head")

  const canReadPlacementQueue =
    authCtx.role === "university_admin" || authCtx.role === "super_admin"

  if (hasUniversityWideStatsAccess) {
    tools.get_platform_stats = tool({
      description:
        "Get platform or university statistics: student counts, placement rates, application breakdowns. " +
        "Use this when the user asks about stats, numbers, or performance metrics.",
      inputSchema: z.object({}),
      execute: async () => {
        try {
          // super_admin gets global stats, others get university-scoped
          if (authCtx.role === "super_admin") {
            const stats = await getAdminStats()
            return stats
          }

          if (authCtx.universityId) {
            const stats = await getUniversityDashboardStats(
              authCtx.universityId,
            )
            return stats
          }

          return { error: "No university associated with your account." }
        } catch {
          return { error: "Failed to retrieve stats. Please try again." }
        }
      },
    })
  }

  if (canReadPlacementQueue) {
    tools.get_pending_placements = tool({
      description:
        "Get applications awaiting admin validation (company-accepted, pending your review). " +
        "Use this when the user asks about pending validations, placements to review, or workload.",
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const viewerRole =
            authCtx.universityMembershipRole === "department_head"
              ? ("department_head" as const)
              : (authCtx.role as "university_admin" | "super_admin")
          const viewer = {
            role: viewerRole,
            universityId: authCtx.universityId,
            departmentId: authCtx.departmentId,
          }

          const result = await listPendingApplications(
            { limit: MAX_PENDING },
            viewer,
          )

          const redacted = redactForAssistant(result.applications)

          return {
            totalPending: result.applications.length,
            hasMore: result.hasMore,
            applications: redacted,
          }
        } catch {
          return {
            error: "Failed to retrieve pending placements. Please try again.",
          }
        }
      },
    })
  }

  // ── Super Admin only ─────────────────────────────────────────────
  if (authCtx.role === "super_admin") {
    tools.get_company_trust_overview = tool({
      description:
        "Get trust score rankings across all companies on the platform. " +
        "Use this when the user asks about company rankings, trust overview, or which companies need attention.",
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const rankings = await listCompanyTrustIndices(MAX_TRUST_LIST)
          const redacted = redactForAssistant(rankings)
          return {
            totalCompanies: rankings.length,
            rankings: redacted,
          }
        } catch {
          return {
            error: "Failed to retrieve trust overview. Please try again.",
          }
        }
      },
    })
  }

  return tools
}
