import { z } from "zod"
import { ORPCError } from "@orpc/server"

import {
  authedProcedure,
  adminProcedure,
  companyAdminProcedure,
} from "../middleware"
import { listCompanies } from "@/server/services/companies/list"
import { getCompanyById } from "@/server/services/companies/get"
import { createCompany } from "@/server/services/companies/create"
import { updateCompany } from "@/server/services/companies/update"
import { approveCompany } from "@/server/services/companies/approve"
import { rejectCompany } from "@/server/services/companies/reject"
import {
  companyQualityFeedbackSchema,
  companyReportSchema,
  resolveCompanyReportSchema,
} from "@/lib/schemas/company"
import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import { eq } from "drizzle-orm"
import { uploadImageToS3 } from "@/server/services/uploads/upload-image"
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

/* ── Reads ── */

export const listCompaniesProcedure = authedProcedure
  .input(
    z
      .object({
        status: z
          .enum(["pending", "approved", "rejected", "suspended"])
          .optional(),
      })
      .optional(),
  )
  .handler(async ({ input, context }) => {
    const isAdmin = context.user.role === "admin" || context.user.role === "super_admin"
    const effectiveStatus = isAdmin ? input?.status : "approved"
    return listCompanies(effectiveStatus)
  })

export const getCompanyByIdProcedure = authedProcedure
  .input(z.object({ companyId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    const company = await getCompanyById(input.companyId)
    if (!company) return null

    const isAdmin =
      context.user.role === "admin" || context.user.role === "super_admin"

    // Check if user is a member of this company
    let isOwner = false
    if (context.user.role === "company_admin") {
      const [membership] = await db
        .select()
        .from(companyMember)
        .where(eq(companyMember.userId, context.user.id))
        .limit(1)
      isOwner = membership?.companyId === company.id
    }

    // Admins and owners see full data
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

export const getCompanyTrustIndexProcedure = authedProcedure
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

export const listCompanyTrustIndicesProcedure = adminProcedure
  .input(z.object({ limit: z.coerce.number().int().min(1).max(200).optional() }).optional())
  .handler(async ({ input }) => listCompanyTrustIndices(input?.limit ?? 50))

export const submitCompanyQualityFeedbackProcedure = authedProcedure
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

export const submitCompanyReportProcedure = authedProcedure
  .input(companyReportSchema)
  .handler(async ({ input, context }) =>
    submitCompanyReport({
      reporterUserId: context.user.id,
      ...input,
    }),
  )

export const listCompanyReportsProcedure = adminProcedure
  .input(
    z
      .object({
        companyId: z.string().min(1).optional(),
        status: z.enum(["open", "reviewing", "resolved", "dismissed"]).optional(),
        limit: z.coerce.number().int().min(1).max(200).optional(),
      })
      .optional(),
  )
  .handler(async ({ input }) => listCompanyReports(input))

export const resolveCompanyReportProcedure = adminProcedure
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

export const createCompanyProcedure = authedProcedure
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

export const updateCompanyProcedure = companyAdminProcedure
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
  .handler(async ({ input, context }) =>
    updateCompany(context.companyMembership.companyId, input),
  )

export const approveCompanyProcedure = adminProcedure
  .input(z.object({ companyId: z.string().min(1) }))
  .handler(async ({ input, context }) =>
    approveCompany(input.companyId, context.user.id),
  )

export const rejectCompanyProcedure = adminProcedure
  .input(
    z.object({
      companyId: z.string().min(1),
      reason: z.string().min(1),
    }),
  )
  .handler(async ({ input }) =>
    rejectCompany(input.companyId, input.reason),
  )

/* ── Uploads ── */

export const uploadCompanyLogoProcedure = companyAdminProcedure
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
