import "server-only"

import { z } from "zod"
import { ORPCError } from "@orpc/server"
import { revalidateTag } from "next/cache"

import { isAdminRole } from "../middleware"
import {
  authedProcedureGenerous,
  authedProcedureStandard,
  companyAdminProcedureStandard,
  superAdminProcedureGenerous,
  superAdminProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { companyStatusSchema, companyReportStatusSchema } from "@/lib/schemas/enums"
import { listCompanies } from "@/server/services/companies/list"
import { getCompanyById } from "@/server/services/companies/get"
import { createCompany } from "@/server/services/companies/create"
import { updateCompany } from "@/server/services/companies/update"
import { approveCompany } from "@/server/services/companies/approve"
import { rejectCompany } from "@/server/services/companies/reject"
import { getCompanyMembership } from "@/server/services/companies/membership"
import {
  companyQualityFeedbackSchema,
  companyReportSchema,
  resolveCompanyReportSchema,
} from "@/lib/schemas/company"
import { uploadImageToS3 } from "@/server/services/uploads/upload-image"
import { createNotification } from "@/server/services/notifications/create"
import { sendEmail } from "@/server/email/sendEmail"
import CompanyApprovedEmail from "@/server/email/emails/CompanyApprovedEmail"
import CompanyRejectedEmail from "@/server/email/emails/CompanyRejectedEmail"
import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import { user } from "@/server/db/schema/auth"
import { eq } from "drizzle-orm"
import { env } from "@/env"
import {
  getCompanyTrustIndex,
  listCompanyTrustIndices,
} from "@/server/services/companies/trust-index"
import {
  listCompanyReports,
  resolveCompanyReport,
  submitCompanyQualityFeedback,
  submitCompanyReport,
} from "@/server/services/companies/trust-actions"
import { CACHE_TAGS } from "@/lib/cache"

/* ── Reads ── */

export const listCompaniesProcedure = authedProcedureGenerous
  .input(
    z
      .object({
        status: companyStatusSchema.optional(),
        limit: z.coerce.number().int().min(1).max(200).optional(),
        offset: z.coerce.number().int().min(0).optional(),
      })
      .optional(),
  )
  .handler(async ({ input, context }) => {
    const isAdmin = isAdminRole(context.user.role)
    const effectiveStatus = isAdmin ? input?.status : "approved"
    return listCompanies({
      status: effectiveStatus,
      limit: input?.limit,
      offset: input?.offset,
    })
  })

export const getCompanyByIdProcedure = authedProcedureGenerous
  .input(z.object({ companyId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    const company = await getCompanyById(input.companyId)
    if (!company) return null

    const isAdmin = isAdminRole(context.user.role)

    let isOwner = false
    if (context.user.role === "company_admin") {
      const membership = await getCompanyMembership(context.user.id)
      isOwner = membership?.companyId === company.id
    }

    if (isAdmin || isOwner) {
      return company
    }

    // Non-approved companies are not visible to regular users
    if (company.status !== "approved") {
      throw new ORPCError("FORBIDDEN", {
        message: "Company not found",
      })
    }

    // Regular users see only public fields (strip sensitive data)
    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      status: company.status,
      description: company.description,
      logoUrl: company.logoUrl,
      websiteUrl: company.websiteUrl,
      wilayaCode: company.wilayaCode,
      createdAt: company.createdAt,
      // Sensitive fields omitted: phone, contactEmail, address,
      // representativeName, rejectionReason
    }
  })

export const getCompanyTrustIndexProcedure = authedProcedureGenerous
  .input(z.object({ companyId: z.string().min(1) }))
  .handler(async ({ input }) => {
    try {
      return await getCompanyTrustIndex(input.companyId)
    } catch (error) {
      if (error instanceof Error && error.message === "Company not found") {
        throw new ORPCError("NOT_FOUND", { message: error.message })
      }
      throw error
    }
  })

export const listCompanyTrustIndicesProcedure = superAdminProcedureGenerous
  .input(z.object({ limit: z.coerce.number().int().min(1).max(200).optional() }).optional())
  .handler(async ({ input }) => listCompanyTrustIndices(input?.limit ?? 50))

export const submitCompanyQualityFeedbackProcedure = authedProcedureStandard
  .input(companyQualityFeedbackSchema)
  .handler(async ({ input, context }) => {
    if (context.user.role !== "student") {
      throw new ORPCError("FORBIDDEN", {
        message: "Only students can submit quality feedback",
      })
    }

    try {
      return await submitCompanyQualityFeedback({
        studentUserId: context.user.id,
        ...input,
      })
    } catch (error) {
      throw new ORPCError("BAD_REQUEST", {
        message: error instanceof Error ? error.message : "Failed to submit feedback",
      })
    }
  })

export const submitCompanyReportProcedure = authedProcedureStandard
  .input(companyReportSchema)
  .handler(async ({ input, context }) =>
    submitCompanyReport({
      reporterUserId: context.user.id,
      ...input,
    }),
  )

export const listCompanyReportsProcedure = superAdminProcedureGenerous
  .input(
    z
      .object({
        companyId: z.string().min(1).optional(),
        status: companyReportStatusSchema.optional(),
        limit: z.coerce.number().int().min(1).max(200).optional(),
      })
      .optional(),
  )
  .handler(async ({ input }) => listCompanyReports(input))

export const resolveCompanyReportProcedure = superAdminProcedureStandard
  .input(resolveCompanyReportSchema)
  .handler(async ({ input, context }) =>
    resolveCompanyReport({
      reportId: input.reportId,
      adminUserId: context.user.id,
      status: input.status,
      resolutionNote: input.resolutionNote,
    }),
  )

/* ── Mutations ── */

export const createCompanyProcedure = authedProcedureStandard
  .use(async ({ context, next }) => {
    // Only company_admin role can create companies
    if (context.user.role !== "company_admin") {
      throw new ORPCError("FORBIDDEN", {
        message: "Company admin access required",
      })
    }
    return next({ context })
  })
  .input(
    z.object({
      name: z.string().min(2),
      description: z.string().optional(),
      websiteUrl: z.string().url().optional().or(z.literal("")),
      wilayaCode: z.coerce.number().int().min(1).max(58),
      address: z.string().optional(),
    }),
  )
  .handler(async ({ input, context }) =>
    createCompany(input, context.user.id),
  )

export const updateCompanyProcedure = companyAdminProcedureStandard
  .input(
    z.object({
      description: z.string().optional(),
      logoUrl: z.string().url().optional().or(z.literal("")),
      websiteUrl: z.string().url().optional().or(z.literal("")),
      phone: z.string().optional(),
      contactEmail: z.string().email().optional().or(z.literal("")),
      representativeName: z.string().optional(),
      wilayaCode: z.coerce.number().int().min(1).max(58).optional(),
      address: z.string().optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    const result = await updateCompany(context.companyMembership.companyId, input)

    // Invalidate company cache
    revalidateTag(CACHE_TAGS.COMPANY_PROFILE(context.companyMembership.companyId), "max")
    revalidateTag(CACHE_TAGS.COMPANY_PROFILE(`user-${context.user.id}`), "max")

    return result
  })

export const approveCompanyProcedure = superAdminProcedureStandard
  .input(z.object({ companyId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    const result = await approveCompany(input.companyId, context.user.id)

    // Invalidate company cache when approved
    revalidateTag(CACHE_TAGS.COMPANY_PROFILE(input.companyId), "max")

    // Notify company members (in-app + email)
    const members = await db
      .select({ userId: companyMember.userId, email: user.email })
      .from(companyMember)
      .innerJoin(user, eq(companyMember.userId, user.id))
      .where(eq(companyMember.companyId, input.companyId))

    const dashboardUrl = `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/dashboard`
    for (const m of members) {
      await createNotification({
        userId: m.userId,
        type: "company_approved",
        payload: { companyId: input.companyId, companyName: result.name },
      })
      sendEmail(
        m.email,
        `${result.name} has been approved — Internex`,
        CompanyApprovedEmail,
        { companyName: result.name, dashboardUrl },
      )
    }

    return result
  })

export const rejectCompanyProcedure = superAdminProcedureStandard
  .input(
    z.object({
      companyId: z.string().min(1),
      reason: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    const result = await rejectCompany(input.companyId, input.reason, context.user.id)

    // Invalidate company cache when rejected
    revalidateTag(CACHE_TAGS.COMPANY_PROFILE(input.companyId), "max")

    // Notify company members (in-app + email)
    const members = await db
      .select({ userId: companyMember.userId, email: user.email })
      .from(companyMember)
      .innerJoin(user, eq(companyMember.userId, user.id))
      .where(eq(companyMember.companyId, input.companyId))

    for (const m of members) {
      await createNotification({
        userId: m.userId,
        type: "company_rejected",
        payload: { companyId: input.companyId, companyName: result.name, reason: input.reason },
      })
      sendEmail(
        m.email,
        `Update on your ${result.name} application — Internex`,
        CompanyRejectedEmail,
        { companyName: result.name, reason: input.reason },
      )
    }

    return result
  })

/* ── Uploads ── */

export const uploadCompanyLogoProcedure = companyAdminProcedureStandard
  .input(
    z.object({
      file: z.file(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      return await uploadImageToS3({ file: input.file, folder: "logos" })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed"

      if (
        message.startsWith("Invalid file type") ||
        message.startsWith("File too large") ||
        message.startsWith("File content")
      ) {
        throw new ORPCError("BAD_REQUEST", { message })
      }

      if (message.startsWith("S3 is not configured")) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message })
      }

      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Upload failed. Please try again.",
      })
    }
  })
