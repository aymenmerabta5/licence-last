import "server-only"

import { ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"

import { authedProcedure, studentProcedure } from "../middleware"
import {
  captureReadinessSnapshotSchema,
  getMatchingScoreSchema,
  getReadinessHistorySchema,
  getSkillGapSchema,
} from "@/lib/schemas/matching"
import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import {
  canAccessMatchScore,
  getExplainableMatchScore,
  getOfferAccessContext,
} from "@/server/services/matching/score"
import { getSkillGapRoadmap } from "@/server/services/matching/skill-gap"
import {
  captureReadinessSnapshot,
  listReadinessHistory,
} from "@/server/services/matching/readiness-history"

async function assertMatchAccess(context: {
  user: { id: string; role: string | null | undefined }
}, input: { studentUserId: string; offerId: string }) {
  const offerAccessContext = await getOfferAccessContext(input.offerId)
  if (!offerAccessContext) {
    throw new ORPCError("NOT_FOUND", { message: "Offer not found" })
  }

  let viewerCompanyId: string | undefined
  if (context.user.role === "company_admin") {
    const [membership] = await db
      .select({ companyId: companyMember.companyId })
      .from(companyMember)
      .where(eq(companyMember.userId, context.user.id))
      .limit(1)
    viewerCompanyId = membership?.companyId
  }

  const canAccess = await canAccessMatchScore(
    { id: context.user.id, role: context.user.role ?? "student" },
    {
      studentUserId: input.studentUserId,
      offerCompanyId: offerAccessContext.companyId,
      isOfferVisibleToStudent: offerAccessContext.status === "published",
      viewerCompanyId,
    },
  )

  if (!canAccess) {
    throw new ORPCError("FORBIDDEN", {
      message: "You do not have access to this match score",
    })
  }
}

export const getScoreProcedure = authedProcedure
  .input(getMatchingScoreSchema)
  .handler(async ({ input, context }) => {
    await assertMatchAccess(context, input)
    return getExplainableMatchScore(input.studentUserId, input.offerId)
  })

export const getSkillGapProcedure = authedProcedure
  .input(getSkillGapSchema)
  .handler(async ({ input, context }) => {
    await assertMatchAccess(context, input)
    return getSkillGapRoadmap(input.studentUserId, input.offerId)
  })

export const getReadinessHistoryProcedure = authedProcedure
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

export const captureReadinessSnapshotProcedure = studentProcedure
  .input(captureReadinessSnapshotSchema)
  .handler(async ({ input, context }) =>
    captureReadinessSnapshot(
      context.user.id,
      input.offerId,
      input.source,
      {
        actor: "student",
      },
    ),
  )
