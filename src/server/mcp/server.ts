import "server-only"

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { eq } from "drizzle-orm"
import * as z from "zod/v4"

import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { company } from "@/server/db/schema/companies"
import { toToolError } from "@/server/mcp/errors"
import {
  assertDevMcpAllowed,
  assertMutatingConfirmed,
  getHealthReport,
} from "@/server/mcp/guards"
import { createCleanupPlan, executeCleanup } from "@/server/mcp/mock/cleanup"
import { listSeedScenarios, runSeedScenario } from "@/server/mcp/mock/scenarios"
import { toolError, toolOk } from "@/server/mcp/response"
import { companyAcceptApplication } from "@/server/services/applications/company-accept"
import { companyRefuseApplication } from "@/server/services/applications/company-refuse"
import { withdrawApplication } from "@/server/services/applications/withdraw"
import { approveCompany } from "@/server/services/companies/approve"
import { rejectCompany } from "@/server/services/companies/reject"
import { updateOfferStatus } from "@/server/services/offers/update-status"
import { rejectPlacement } from "@/server/services/placements/reject"
import { validatePlacement } from "@/server/services/placements/validate"
import { promoteUser } from "@/server/services/users/promote"

async function resolveUserId(userIdOrEmail: string) {
  const [byId] = await db
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(eq(user.id, userIdOrEmail))
    .limit(1)
  if (byId) return byId.id

  const [byEmail] = await db
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(eq(user.email, userIdOrEmail))
    .limit(1)
  if (byEmail) return byEmail.id

  throw new Error(`User not found: ${userIdOrEmail}`)
}

async function resolveCompanyId(companyIdOrSlug: string) {
  const [byId] = await db
    .select({ id: company.id, slug: company.slug, status: company.status })
    .from(company)
    .where(eq(company.id, companyIdOrSlug))
    .limit(1)
  if (byId) return byId.id

  const [bySlug] = await db
    .select({ id: company.id, slug: company.slug, status: company.status })
    .from(company)
    .where(eq(company.slug, companyIdOrSlug))
    .limit(1)
  if (bySlug) return bySlug.id

  throw new Error(`Company not found: ${companyIdOrSlug}`)
}

function parseDate(value: string, fieldName: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${fieldName}: ${value}`)
  }
  return parsed
}

function withToolHandler<TInput extends object>(
  handler: (input: TInput) => Promise<unknown>,
) {
  return async (input: TInput) => {
    try {
      return toolOk(await handler(input))
    } catch (error) {
      return toolError(toToolError(error))
    }
  }
}

export function createStagDevMcpServer() {
  const server = new McpServer({
    name: "stag-local-dev-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "stag.dev.health",
    {
      description:
        "Report MCP guard status and sanitized database fingerprint.",
      inputSchema: {},
    },
    withToolHandler(async () => {
      return getHealthReport()
    }),
  )

  server.registerTool(
    "stag.dev.seed.list_scenarios",
    {
      description: "List available developer seed scenarios.",
      inputSchema: {},
    },
    withToolHandler(async () => {
      assertDevMcpAllowed()
      return {
        scenarios: listSeedScenarios(),
      }
    }),
  )

  server.registerTool(
    "stag.dev.seed.run",
    {
      description:
        "Create linked mock data for one scenario in the development database.",
      inputSchema: {
        scenario: z.enum([
          "student_discovery",
          "company_hiring_funnel",
          "admin_validation_queue",
        ]),
        scale: z.number().int().min(1).max(20).default(1),
        confirmWrite: z.boolean().optional(),
      },
    },
    withToolHandler(async (input) => {
      assertDevMcpAllowed()
      assertMutatingConfirmed(input.confirmWrite)
      return runSeedScenario(input.scenario, input.scale)
    }),
  )

  server.registerTool(
    "stag.dev.users.set_role",
    {
      description: "Set a user's role by id or email.",
      inputSchema: {
        userIdOrEmail: z.string().min(1),
        newRole: z.enum([
          "student",
          "company_admin",
          "university_admin",
          "super_admin",
        ]),
        confirmWrite: z.boolean().optional(),
      },
    },
    withToolHandler(async (input) => {
      assertDevMcpAllowed()
      assertMutatingConfirmed(input.confirmWrite)

      const userId = await resolveUserId(input.userIdOrEmail)
      return promoteUser(userId, input.newRole)
    }),
  )

  server.registerTool(
    "stag.dev.companies.set_status",
    {
      description: "Change company status by company id or slug.",
      inputSchema: {
        companyIdOrSlug: z.string().min(1),
        status: z.enum(["approved", "rejected", "pending", "suspended"]),
        reason: z.string().optional(),
        actedByUserId: z.string().optional(),
        confirmWrite: z.boolean().optional(),
      },
    },
    withToolHandler(async (input) => {
      assertDevMcpAllowed()
      assertMutatingConfirmed(input.confirmWrite)

      const companyId = await resolveCompanyId(input.companyIdOrSlug)

      if (input.status === "approved") {
        if (!input.actedByUserId) {
          throw new Error("actedByUserId is required when status=approved")
        }
        return approveCompany(companyId, input.actedByUserId)
      }

      if (input.status === "rejected") {
        const reason = input.reason?.trim()
        if (!reason) {
          throw new Error("reason is required when status=rejected")
        }
        return rejectCompany(companyId, reason, "mcp-system")
      }

      const [updated] =
        input.status === "pending"
          ? await db
              .update(company)
              .set({
                status: "pending",
                approvedAt: null,
                approvedByUserId: null,
                rejectionReason: null,
              })
              .where(eq(company.id, companyId))
              .returning({
                id: company.id,
                slug: company.slug,
                status: company.status,
              })
          : await db
              .update(company)
              .set({ status: "suspended" })
              .where(eq(company.id, companyId))
              .returning({
                id: company.id,
                slug: company.slug,
                status: company.status,
              })

      if (!updated) {
        throw new Error("Company not found")
      }

      return updated
    }),
  )

  server.registerTool(
    "stag.dev.offers.transition_status",
    {
      description: "Transition offer status using the domain service rules.",
      inputSchema: {
        offerId: z.string().min(1),
        companyId: z.string().min(1),
        action: z.enum(["publish", "close"]),
        confirmWrite: z.boolean().optional(),
      },
    },
    withToolHandler(async (input) => {
      assertDevMcpAllowed()
      assertMutatingConfirmed(input.confirmWrite)

      return updateOfferStatus(input.offerId, input.companyId, input.action)
    }),
  )

  server.registerTool(
    "stag.dev.applications.transition",
    {
      description:
        "Apply role-aware application transitions: company accept/refuse, student withdraw, admin validate/reject.",
      inputSchema: {
        applicationId: z.string().min(1),
        action: z.enum([
          "company_accept",
          "company_refuse",
          "student_withdraw",
          "admin_validate",
          "admin_reject",
        ]),
        companyId: z.string().optional(),
        actionByUserId: z.string().optional(),
        studentUserId: z.string().optional(),
        adminRole: z.enum(["university_admin", "super_admin"]).optional(),
        adminUniversityId: z.string().nullable().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        reason: z.string().optional(),
        confirmWrite: z.boolean().optional(),
      },
    },
    withToolHandler(async (input) => {
      assertDevMcpAllowed()
      assertMutatingConfirmed(input.confirmWrite)

      if (input.action === "company_accept") {
        if (!input.companyId || !input.actionByUserId) {
          throw new Error(
            "companyId and actionByUserId are required for company_accept",
          )
        }
        return companyAcceptApplication(
          input.applicationId,
          input.companyId,
          input.actionByUserId,
        )
      }

      if (input.action === "company_refuse") {
        if (!input.companyId || !input.actionByUserId) {
          throw new Error(
            "companyId and actionByUserId are required for company_refuse",
          )
        }
        return companyRefuseApplication(
          input.applicationId,
          input.companyId,
          input.actionByUserId,
          input.reason,
        )
      }

      if (input.action === "student_withdraw") {
        if (!input.studentUserId) {
          throw new Error("studentUserId is required for student_withdraw")
        }
        return withdrawApplication(input.applicationId, input.studentUserId)
      }

      if (input.action === "admin_validate") {
        if (
          !input.actionByUserId ||
          !input.adminRole ||
          !input.startDate ||
          !input.endDate
        ) {
          throw new Error(
            "actionByUserId, adminRole, startDate and endDate are required for admin_validate",
          )
        }

        return validatePlacement({
          applicationId: input.applicationId,
          adminUserId: input.actionByUserId,
          adminRole: input.adminRole,
          adminUniversityId: input.adminUniversityId ?? null,
          startDate: parseDate(input.startDate, "startDate"),
          endDate: parseDate(input.endDate, "endDate"),
        })
      }

      if (!input.actionByUserId || !input.adminRole) {
        throw new Error(
          "actionByUserId and adminRole are required for admin_reject",
        )
      }

      return rejectPlacement({
        applicationId: input.applicationId,
        adminUserId: input.actionByUserId,
        adminRole: input.adminRole,
        adminUniversityId: input.adminUniversityId ?? null,
        reason: input.reason,
      })
    }),
  )

  server.registerTool(
    "stag.dev.seed.cleanup_plan",
    {
      description:
        "Prepare a cleanup plan for seeded data and issue a short-lived confirmation token.",
      inputSchema: {
        mode: z.enum(["batch_only", "all_mcpdev_data"]).default("batch_only"),
        batchId: z.string().optional(),
      },
    },
    withToolHandler(async (input) => {
      assertDevMcpAllowed()
      return createCleanupPlan({
        mode: input.mode,
        batchId: input.batchId,
      })
    }),
  )

  server.registerTool(
    "stag.dev.seed.cleanup_execute",
    {
      description: "Execute cleanup using a token created by cleanup_plan.",
      inputSchema: {
        mode: z.enum(["batch_only", "all_mcpdev_data"]).default("batch_only"),
        batchId: z.string().optional(),
        token: z.string().min(1),
        confirmWrite: z.boolean().optional(),
      },
    },
    withToolHandler(async (input) => {
      assertDevMcpAllowed()
      assertMutatingConfirmed(input.confirmWrite)
      return executeCleanup({
        mode: input.mode,
        batchId: input.batchId,
        token: input.token,
      })
    }),
  )

  return server
}
