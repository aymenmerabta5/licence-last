import "server-only"

import { ORPCError } from "@orpc/server"
import { and, eq } from "drizzle-orm"
import {
  captureReadinessSnapshotSchema,
  getMatchingScoreSchema,
  getReadinessHistorySchema,
  getSkillGapSchema,
} from "@/lib/schemas/matching"
import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { companyMember } from "@/server/db/schema/companies"
import {
  authedProcedureGenerous,
  studentProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import {
  captureReadinessSnapshot,
  listReadinessHistory,
} from "@/server/services/matching/readiness-history"
import {
  canAccessMatchScore,
  getExplainableMatchScore,
  getOfferAccessContext,
} from "@/server/services/matching/score"
import { getSkillGapRoadmap } from "@/server/services/matching/skill-gap"

async function assertMatchAccess(
  context: {
    user: { id: string; role: string | null | undefined }
  },
  input: { studentUserId: string; offerId: string },
) {
  const offerAccessContext = await getOfferAccessContext(input.offerId)
  if (!offerAccessContext) {
    throw new ORPCError("NOT_FOUND", { message: "Offer not found" })
  }

  let viewerCompanyId: string | undefined
  let hasApplicationRelationship: boolean | undefined
  if (context.user.role === "company_admin") {
    const memberships = await db
      .select({ companyId: companyMember.companyId })
      .from(companyMember)
      .where(eq(companyMember.userId, context.user.id))
      .limit(2)
    if (memberships.length > 1) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Multiple company memberships found for user",
      })
    }
    const membership = memberships[0]
    viewerCompanyId = membership?.companyId

    const [relationship] = await db
      .select({ id: application.id })
      .from(application)
      .where(
        and(
          eq(application.offerId, input.offerId),
          eq(application.studentUserId, input.studentUserId),
        ),
      )
      .limit(1)

    hasApplicationRelationship = Boolean(relationship)
  }

  const canAccess = await canAccessMatchScore(
    { id: context.user.id, role: context.user.role ?? "student" },
    {
      studentUserId: input.studentUserId,
      offerCompanyId: offerAccessContext.companyId,
      isOfferVisibleToStudent: offerAccessContext.status === "published",
      viewerCompanyId,
      hasApplicationRelationship,
    },
  )

  if (!canAccess) {
    throw new ORPCError("FORBIDDEN", {
      message: "You do not have access to this match score",
    })
  }
}

export const getScoreProcedure = authedProcedureGenerous
  .input(getMatchingScoreSchema)
  .handler(async ({ input, context }) => {
    await assertMatchAccess(context, input)
    return getExplainableMatchScore(input.studentUserId, input.offerId)
  })

export const getSkillGapProcedure = authedProcedureGenerous
  .input(getSkillGapSchema)
  .handler(async ({ input, context }) => {
    await assertMatchAccess(context, input)
    return getSkillGapRoadmap(input.studentUserId, input.offerId)
  })

export const getReadinessHistoryProcedure = authedProcedureGenerous
  .input(getReadinessHistorySchema)
  .handler(async ({ input, context }) => {
    await assertMatchAccess(context, input)
    const points = await listReadinessHistory(
      input.studentUserId,
      input.offerId,
      input.limit,
    )
    return { points }
  })

export const captureReadinessSnapshotProcedure = studentProcedureStandard
  .input(captureReadinessSnapshotSchema)
  .handler(async ({ input, context }) =>
    captureReadinessSnapshot(context.user.id, input.offerId, input.source, {
      actor: "student",
    }),
  )
