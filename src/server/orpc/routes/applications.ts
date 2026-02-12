import "server-only"

import { z } from "zod"
import { ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"
import { updateTag } from "next/cache"

import { authedProcedure, studentProcedure, companyAdminProcedure, isAdminRole } from "../middleware"
import { applicationStatusSchema, pipelineStageSchema } from "@/lib/schemas/enums"
import {
  searchOffersSchema,
  applyToOfferSchema,
  listStudentApplicationsSchema,
} from "@/lib/schemas/search"
import { searchOffers } from "@/server/services/offers/search"
import { getStudentApplicationForOffer } from "@/server/services/offers/get"
import { applyToOffer } from "@/server/services/applications/apply"
import { listApplicationsByStudent } from "@/server/services/applications/list-by-student"
import { withdrawApplication } from "@/server/services/applications/withdraw"
import { listApplicationsByOffer } from "@/server/services/applications/list-by-offer"
import { companyAcceptApplication } from "@/server/services/applications/company-accept"
import { companyRefuseApplication } from "@/server/services/applications/company-refuse"
import {
  listApplicationTimeline,
  updateApplicationPipelineStage,
} from "@/server/services/applications/pipeline"
import { isApplicationServiceError } from "@/server/services/applications/errors"
import { db } from "@/server/db"
import {
  getApplyToOfferStatus,
  getWithdrawStatus,
  getCompanyActionStatus,
  createApplicationORPCError,
} from "./applications.error-mapping"
import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { companyMember } from "@/server/db/schema/companies"
import { CACHE_TAGS } from "@/lib/cache"

/* ── Offer Search (any authenticated user) ── */

export const searchOffersProcedure = authedProcedure
  .input(searchOffersSchema)
  .handler(async ({ input }) => searchOffers(input))

/* ── Application Procedures (student only) ── */

export const checkApplicationProcedure = studentProcedure
  .input(z.object({ offerId: z.string().min(1) }))
  .handler(async ({ input, context }) =>
    getStudentApplicationForOffer(input.offerId, context.user.id),
  )

export const applyToOfferProcedure = studentProcedure
  .input(applyToOfferSchema)
  .handler(async ({ input, context }) => {
    try {
      const result = await applyToOffer(
        input.offerId,
        context.user.id,
        input.coverLetter,
      )

      // Invalidate student applications cache
      updateTag(CACHE_TAGS.STUDENT_APPLICATIONS(context.user.id))
      updateTag(CACHE_TAGS.STUDENT_STATS(context.user.id))

      return result
    } catch (error) {
      if (isApplicationServiceError(error)) {
        throw createApplicationORPCError(error, getApplyToOfferStatus(error.code))
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to apply",
      })
    }
  })

export const listStudentApplicationsProcedure = studentProcedure
  .input(listStudentApplicationsSchema)
  .handler(async ({ input, context }) =>
    listApplicationsByStudent(context.user.id, input),
  )

export const withdrawApplicationProcedure = studentProcedure
  .input(z.object({ applicationId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    try {
      const result = await withdrawApplication(input.applicationId, context.user.id)

      // Invalidate student applications cache
      updateTag(CACHE_TAGS.STUDENT_APPLICATIONS(context.user.id))
      updateTag(CACHE_TAGS.STUDENT_STATS(context.user.id))

      return result
    } catch (error) {
      if (isApplicationServiceError(error)) {
        throw createApplicationORPCError(error, getWithdrawStatus(error.code))
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to withdraw",
      })
    }
  })

/* ── Company Admin Procedures ── */

export const listByOfferProcedure = companyAdminProcedure
  .input(
    z.object({
      offerId: z.string().min(1),
      status: applicationStatusSchema.optional(),
      pipelineStage: pipelineStageSchema.optional(),
      cursor: z.object({ createdAt: z.string(), id: z.string() }).optional(),
      limit: z.coerce.number().int().min(1).max(50).optional(),
    }),
  )
  .handler(async ({ input, context }) =>
    listApplicationsByOffer(
      input.offerId,
      context.companyMembership.companyId,
      {
        status: input.status,
        pipelineStage: input.pipelineStage,
        cursor: input.cursor,
        limit: input.limit,
      },
    ),
  )

export const companyAcceptProcedure = companyAdminProcedure
  .input(z.object({ applicationId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    try {
      const result = await companyAcceptApplication(
        input.applicationId,
        context.companyMembership.companyId,
        context.user.id,
      )

      // Invalidate company candidates cache
      updateTag(CACHE_TAGS.COMPANY_CANDIDATES(context.companyMembership.companyId))

      return result
    } catch (error) {
      if (isApplicationServiceError(error)) {
        throw createApplicationORPCError(error, getCompanyActionStatus(error.code))
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to accept application",
      })
    }
  })

export const companyRefuseProcedure = companyAdminProcedure
  .input(
    z.object({
      applicationId: z.string().min(1),
      note: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      const result = await companyRefuseApplication(
        input.applicationId,
        context.companyMembership.companyId,
        context.user.id,
        input.note,
      )

      // Invalidate company candidates cache
      updateTag(CACHE_TAGS.COMPANY_CANDIDATES(context.companyMembership.companyId))

      return result
    } catch (error) {
      if (isApplicationServiceError(error)) {
        throw createApplicationORPCError(error, getCompanyActionStatus(error.code))
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to refuse application",
      })
    }
  })

export const updatePipelineStageProcedure = companyAdminProcedure
  .input(
    z.object({
      applicationId: z.string().min(1),
      toStage: pipelineStageSchema,
      note: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      return await updateApplicationPipelineStage({
        applicationId: input.applicationId,
        actorUserId: context.user.id,
        companyId: context.companyMembership.companyId,
        toStage: input.toStage,
        note: input.note,
      })
    } catch (error) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          error instanceof Error ? error.message : "Failed to update pipeline stage",
      })
    }
  })

export const getTimelineProcedure = authedProcedure
  .input(z.object({ applicationId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    const [row] = await db
      .select({
        id: application.id,
        studentUserId: application.studentUserId,
        companyId: internshipOffer.companyId,
      })
      .from(application)
      .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
      .where(eq(application.id, input.applicationId))
      .limit(1)

    if (!row) {
      throw new ORPCError("NOT_FOUND", { message: "Application not found" })
    }

    const isAdmin = isAdminRole(context.user.role)
    const isStudentOwner =
      context.user.role === "student" && context.user.id === row.studentUserId

    let isCompanyOwner = false
    if (context.user.role === "company_admin") {
      const [membership] = await db
        .select({ companyId: companyMember.companyId })
        .from(companyMember)
        .where(eq(companyMember.userId, context.user.id))
        .limit(1)
      isCompanyOwner = membership?.companyId === row.companyId
    }

    if (!isAdmin && !isStudentOwner && !isCompanyOwner) {
      throw new ORPCError("FORBIDDEN", {
        message: "You do not have access to this timeline",
      })
    }

    return listApplicationTimeline(input.applicationId)
  })
