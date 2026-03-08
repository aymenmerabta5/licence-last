import "server-only"

import { ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { z } from "zod"
import { CACHE_TAGS } from "@/lib/cache"
import {
  applicationStatusSchema,
  pipelineStageSchema,
} from "@/lib/schemas/enums"
import {
  applyToOfferSchema,
  listStudentApplicationsSchema,
  searchOffersSchema,
} from "@/lib/schemas/search"
import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { companyMember } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { studentProfile } from "@/server/db/schema/students"
import {
  canAccessApplicationTimeline,
} from "@/server/orpc/utils/student-scope"
import {
  assistantProcedureLimited,
  authedProcedureGenerous,
  companyAdminProcedureGenerous,
  companyAdminProcedureStandard,
  studentProcedureGenerous,
  studentProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import {
  createApplicationORPCError,
  getApplyToOfferStatus,
  getCompanyActionStatus,
  getListByOfferStatus,
  getWithdrawStatus,
} from "@/server/orpc/routes/applications.error-mapping"
import { createServiceORPCError } from "@/server/orpc/utils/service-error"
import { applyToOffer } from "@/server/services/applications/apply"
import { companyAcceptApplication } from "@/server/services/applications/company-accept"
import { companyRefuseApplication } from "@/server/services/applications/company-refuse"
import { isApplicationServiceError } from "@/server/services/applications/errors"
import { listApplicationsByOffer } from "@/server/services/applications/list-by-offer"
import { listApplicationsByStudent } from "@/server/services/applications/list-by-student"
import {
  listApplicationTimeline,
  updateApplicationPipelineStage,
} from "@/server/services/applications/pipeline"
import { withdrawApplication } from "@/server/services/applications/withdraw"
import { getStudentApplicationForOffer } from "@/server/services/offers/get"
import { searchOffers } from "@/server/services/offers/search"

/* Offer Search */

export const searchOffersProcedure = authedProcedureGenerous
  .input(searchOffersSchema)
  .handler(async ({ input }) => searchOffers(input))

/* Application Procedures */

export const checkApplicationProcedure = studentProcedureGenerous
  .input(z.object({ offerId: z.string().min(1) }))
  .handler(async ({ input, context }) =>
    getStudentApplicationForOffer(input.offerId, context.user.id),
  )

export const applyToOfferProcedure = studentProcedureStandard
  .input(applyToOfferSchema)
  .handler(async ({ input, context }) => {
    try {
      const result = await applyToOffer(
        input.offerId,
        context.user.id,
        input.coverLetter,
      )

      revalidateTag(CACHE_TAGS.STUDENT_APPLICATIONS(context.user.id), "max")
      revalidateTag(CACHE_TAGS.STUDENT_STATS(context.user.id), "max")

      return result
    } catch (error) {
      if (isApplicationServiceError(error)) {
        throw createApplicationORPCError(
          error,
          getApplyToOfferStatus(error.code),
        )
      }
      createServiceORPCError(error, {
        codeMap: {},
        fallbackMessage: "Failed to apply",
      })
    }
  })

export const listStudentApplicationsProcedure = studentProcedureGenerous
  .input(listStudentApplicationsSchema)
  .handler(async ({ input, context }) =>
    listApplicationsByStudent(context.user.id, input),
  )

export const withdrawApplicationProcedure = studentProcedureStandard
  .input(z.object({ applicationId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    try {
      const result = await withdrawApplication(
        input.applicationId,
        context.user.id,
      )

      revalidateTag(CACHE_TAGS.STUDENT_APPLICATIONS(context.user.id), "max")
      revalidateTag(CACHE_TAGS.STUDENT_STATS(context.user.id), "max")

      return result
    } catch (error) {
      if (isApplicationServiceError(error)) {
        throw createApplicationORPCError(error, getWithdrawStatus(error.code))
      }
      createServiceORPCError(error, {
        codeMap: {},
        fallbackMessage: "Failed to withdraw",
      })
    }
  })

/* Company Admin Procedures */

export const listByOfferProcedure = companyAdminProcedureGenerous
  .input(
    z.object({
      offerId: z.string().min(1),
      status: applicationStatusSchema.optional(),
      pipelineStage: pipelineStageSchema.optional(),
      cursor: z.object({ createdAt: z.string(), id: z.string() }).optional(),
      limit: z.coerce.number().int().min(1).max(50).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      return await listApplicationsByOffer(
        input.offerId,
        context.companyMembership.companyId,
        {
          status: input.status,
          pipelineStage: input.pipelineStage,
          cursor: input.cursor,
          limit: input.limit,
        },
      )
    } catch (error) {
      if (isApplicationServiceError(error)) {
        throw createApplicationORPCError(
          error,
          getListByOfferStatus(error.code),
        )
      }
      createServiceORPCError(error, {
        codeMap: {},
        fallbackMessage: "Failed to list applications",
      })
    }
  })

export const companyAcceptProcedure = companyAdminProcedureStandard
  .input(z.object({ applicationId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    try {
      const result = await companyAcceptApplication(
        input.applicationId,
        context.companyMembership.companyId,
        context.user.id,
      )

      revalidateTag(
        CACHE_TAGS.COMPANY_CANDIDATES(context.companyMembership.companyId),
        "max",
      )

      return result
    } catch (error) {
      if (isApplicationServiceError(error)) {
        throw createApplicationORPCError(
          error,
          getCompanyActionStatus(error.code),
        )
      }
      createServiceORPCError(error, {
        codeMap: {},
        fallbackMessage: "Failed to accept application",
      })
    }
  })

export const companyRefuseProcedure = companyAdminProcedureStandard
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

      revalidateTag(
        CACHE_TAGS.COMPANY_CANDIDATES(context.companyMembership.companyId),
        "max",
      )

      return result
    } catch (error) {
      if (isApplicationServiceError(error)) {
        throw createApplicationORPCError(
          error,
          getCompanyActionStatus(error.code),
        )
      }
      createServiceORPCError(error, {
        codeMap: {},
        fallbackMessage: "Failed to refuse application",
      })
    }
  })

export const updatePipelineStageProcedure = companyAdminProcedureStandard
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
      if (isApplicationServiceError(error)) {
        throw createApplicationORPCError(
          error,
          getCompanyActionStatus(error.code),
        )
      }
      createServiceORPCError(error, {
        codeMap: {},
        fallbackMessage: "An unexpected error occurred",
      })
    }
  })

/* AI Cover Letter Generation */

export const generateCoverLetterProcedure = assistantProcedureLimited
  .input(
    z.object({
      offerTitle: z.string().min(1),
      offerDescription: z.string().min(1),
      internshipType: z.string().optional(),
      workMode: z.string().nullable().optional(),
      skills: z.array(z.string()),
      companyName: z.string().min(1),
      companyDescription: z.string().nullable().optional(),
      currentCoverLetter: z.string().nullable().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const { generateCoverLetter } = await import(
      "@/server/services/applications/generate-cover-letter"
    )
    return generateCoverLetter(input)
  })

export const getTimelineProcedure = authedProcedureGenerous
  .input(z.object({ applicationId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    const [row] = await db
      .select({
        id: application.id,
        studentUserId: application.studentUserId,
        studentUniversityId: user.universityId,
        studentDepartmentId: studentProfile.departmentId,
        companyId: internshipOffer.companyId,
      })
      .from(application)
      .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
      .innerJoin(user, eq(application.studentUserId, user.id))
      .leftJoin(studentProfile, eq(user.id, studentProfile.userId))
      .where(eq(application.id, input.applicationId))
      .limit(1)

    if (!row) {
      throw new ORPCError("NOT_FOUND", { message: "Application not found" })
    }

    let viewerCompanyId: string | null = null
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
      viewerCompanyId = memberships[0]?.companyId ?? null
    }

    const hasAccess = canAccessApplicationTimeline(
      {
        id: context.user.id,
        role: context.user.role,
        universityId: context.user.universityId,
        departmentId: context.user.departmentId,
        companyId: viewerCompanyId,
      },
      {
        userId: row.studentUserId,
        universityId: row.studentUniversityId,
        departmentId: row.studentDepartmentId,
      },
      row.companyId,
    )

    if (!hasAccess) {
      throw new ORPCError("FORBIDDEN", {
        message: "You do not have access to this timeline",
      })
    }

    return listApplicationTimeline(input.applicationId)
  })