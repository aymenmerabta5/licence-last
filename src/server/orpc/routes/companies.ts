import "server-only"

import { ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { z } from "zod"
import { env } from "@/env"
import { CACHE_TAGS } from "@/lib/cache"
import {
  companyQualityFeedbackSchema,
  companyReportSchema,
  resolveCompanyReportSchema,
} from "@/lib/schemas/company"
import {
  companyReportStatusSchema,
  companyStatusSchema,
} from "@/lib/schemas/enums"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { companyMember } from "@/server/db/schema/companies"
import CompanyApprovedEmail from "@/server/email/templates/CompanyApprovedEmail"
import CompanyRejectedEmail from "@/server/email/templates/CompanyRejectedEmail"
import { isAdminRole } from "@/server/orpc/middleware"
import {
  authedProcedureGenerous,
  authedProcedureStandard,
  companyAdminProcedureGenerous,
  companyAdminProcedureStandard,
  companyOwnerProcedureStandard,
  superAdminProcedureGenerous,
  superAdminProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { createServiceORPCError } from "@/server/orpc/utils/service-error"
import { approveCompany } from "@/server/services/companies/approve"
import { createCompany } from "@/server/services/companies/create"
import { getCompanyById } from "@/server/services/companies/get"
import { inviteCompanyMember } from "@/server/services/companies/invite-member"
import { listCompanies } from "@/server/services/companies/list"
import { listCompanyMembers } from "@/server/services/companies/list-members"
import { getCompanyMembership } from "@/server/services/companies/membership"
import { reactivateCompany } from "@/server/services/companies/reactivate"
import { rejectCompany } from "@/server/services/companies/reject"
import { removeCompanyMember } from "@/server/services/companies/remove-member"
import { suspendCompany } from "@/server/services/companies/suspend"
import {
  listCompanyReports,
  resolveCompanyReport,
  submitCompanyQualityFeedback,
  submitCompanyReport,
} from "@/server/services/companies/trust-actions"
import {
  getCompanyTrustIndex,
  listCompanyTrustIndices,
} from "@/server/services/companies/trust-index"
import { updateCompany } from "@/server/services/companies/update"
import { emitNotification } from "@/server/services/notifications/emit"
import { uploadImageToS3 } from "@/server/services/uploads/upload-image"

/* ── Reads ── */

export const listCompaniesProcedure = authedProcedureGenerous
  .input(
    z
      .object({
        status: companyStatusSchema.optional(),
        search: z.string().trim().min(1).max(120).optional(),
        limit: z.coerce.number().int().min(1).max(200).optional(),
        offset: z.coerce.number().int().min(0).max(10000).optional(),
      })
      .optional(),
  )
  .handler(async ({ input, context }) => {
    const isAdmin = isAdminRole(context.user.role)
    const effectiveStatus = isAdmin ? input?.status : "approved"
    const effectiveSearch =
      context.user.role === "super_admin" ? input?.search : undefined

    return listCompanies({
      status: effectiveStatus,
      search: effectiveSearch,
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
  .input(
    z
      .object({ limit: z.coerce.number().int().min(1).max(200).optional() })
      .optional(),
  )
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
        message:
          error instanceof Error ? error.message : "Failed to submit feedback",
      })
    }
  })

export const submitCompanyReportProcedure = authedProcedureStandard
  .input(companyReportSchema)
  .handler(async ({ input, context }) => {
    if (context.user.role === "company_admin") {
      const membership = await getCompanyMembership(context.user.id)
      if (membership?.companyId === input.companyId) {
        throw new ORPCError("FORBIDDEN", {
          message: "Company admins cannot submit reports against their own company",
        })
      }
    }

    return submitCompanyReport({
      reporterUserId: context.user.id,
      ...input,
    })
  })

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

export const listCompanyMembersProcedure =
  companyAdminProcedureGenerous.handler(async ({ context }) =>
    listCompanyMembers(context.companyMembership.companyId),
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
  .handler(async ({ input, context }) => {
    try {
      return await createCompany(input, context.user.id)
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          COMPANY_MEMBERSHIP_ALREADY_EXISTS: "CONFLICT",
        },
        fallbackMessage: "Failed to create company",
      })
    }
  })

export const inviteCompanyMemberProcedure = companyOwnerProcedureStandard
  .input(
    z.object({
      email: z.string().email(),
      name: z.string().min(2).max(120).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      const result = await inviteCompanyMember({
        companyId: context.companyMembership.companyId,
        invitedByUserId: context.user.id,
        email: input.email,
        name: input.name,
      })

      revalidateTag(CACHE_TAGS.COMPANY_PROFILE(`user-${result.userId}`), "max")
      return result
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          COMPANY_NOT_FOUND: "NOT_FOUND",
          COMPANY_MEMBER_EMAIL_REQUIRED: "BAD_REQUEST",
          COMPANY_MEMBER_CANNOT_INVITE_SELF: "BAD_REQUEST",
          COMPANY_MEMBER_ALREADY_ASSIGNED: "CONFLICT",
          COMPANY_MEMBER_ROLE_NOT_ELIGIBLE: "BAD_REQUEST",
        },
        fallbackMessage: "Failed to invite company member",
      })
    }
  })

export const removeCompanyMemberProcedure = companyOwnerProcedureStandard
  .input(
    z.object({
      userId: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      const result = await removeCompanyMember({
        companyId: context.companyMembership.companyId,
        memberUserId: input.userId,
        removedByUserId: context.user.id,
      })

      revalidateTag(CACHE_TAGS.COMPANY_PROFILE(`user-${input.userId}`), "max")
      return result
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          COMPANY_MEMBER_NOT_FOUND: "NOT_FOUND",
          COMPANY_MEMBER_CANNOT_REMOVE_SELF: "BAD_REQUEST",
          COMPANY_MEMBER_OWNER_IMMUTABLE: "BAD_REQUEST",
        },
        fallbackMessage: "Failed to remove company member",
      })
    }
  })

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
    try {
      const result = await updateCompany(
        context.companyMembership.companyId,
        input,
      )

      // Invalidate company cache
      revalidateTag(
        CACHE_TAGS.COMPANY_PROFILE(context.companyMembership.companyId),
        "max",
      )
      revalidateTag(
        CACHE_TAGS.COMPANY_PROFILE(`user-${context.user.id}`),
        "max",
      )

      return result
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          COMPANY_NOT_FOUND: "NOT_FOUND",
        },
        fallbackMessage: "Failed to update company profile",
      })
    }
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
    await Promise.all(
      members.map((member) =>
        emitNotification({
          userId: member.userId,
          type: "company_approved",
          payload: { companyId: input.companyId, companyName: result.name },
          email: {
            to: member.email,
            subject: `${result.name} has been approved - Internex`,
            component: CompanyApprovedEmail,
            props: { companyName: result.name, dashboardUrl },
          },
        }),
      ),
    )

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
    const result = await rejectCompany(
      input.companyId,
      input.reason,
      context.user.id,
    )

    // Invalidate company cache when rejected
    revalidateTag(CACHE_TAGS.COMPANY_PROFILE(input.companyId), "max")

    // Notify company members (in-app + email)
    const members = await db
      .select({ userId: companyMember.userId, email: user.email })
      .from(companyMember)
      .innerJoin(user, eq(companyMember.userId, user.id))
      .where(eq(companyMember.companyId, input.companyId))

    await Promise.all(
      members.map((member) =>
        emitNotification({
          userId: member.userId,
          type: "company_rejected",
          payload: {
            companyId: input.companyId,
            companyName: result.name,
            reason: input.reason,
          },
          email: {
            to: member.email,
            subject: `Update on your ${result.name} application - Internex`,
            component: CompanyRejectedEmail,
            props: { companyName: result.name, reason: input.reason },
          },
        }),
      ),
    )

    return result
  })

export const suspendCompanyProcedure = superAdminProcedureStandard
  .input(z.object({ companyId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    try {
      const result = await suspendCompany(input.companyId, context.user.id)

      // Invalidate company and public offer caches
      revalidateTag(CACHE_TAGS.COMPANY_PROFILE(input.companyId), "max")
      revalidateTag(CACHE_TAGS.OFFER_SEARCH, { expire: 0 })
      revalidateTag(CACHE_TAGS.OFFERS_PUBLIC, { expire: 0 })

      const members = await db
        .select({ userId: companyMember.userId })
        .from(companyMember)
        .where(eq(companyMember.companyId, input.companyId))

      await Promise.all(
        members.map((member) =>
          emitNotification({
            userId: member.userId,
            type: "company_suspended",
            payload: { companyId: input.companyId, companyName: result.name },
          }),
        ),
      )

      return result
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          COMPANY_NOT_FOUND: "NOT_FOUND",
          COMPANY_INVALID_STATUS_TRANSITION: "BAD_REQUEST",
        },
        fallbackMessage: "Failed to suspend company",
      })
    }
  })

export const reactivateCompanyProcedure = superAdminProcedureStandard
  .input(z.object({ companyId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    try {
      const result = await reactivateCompany(input.companyId, context.user.id)

      // Invalidate company and public offer caches
      revalidateTag(CACHE_TAGS.COMPANY_PROFILE(input.companyId), "max")
      revalidateTag(CACHE_TAGS.OFFER_SEARCH, { expire: 0 })
      revalidateTag(CACHE_TAGS.OFFERS_PUBLIC, { expire: 0 })

      const members = await db
        .select({ userId: companyMember.userId })
        .from(companyMember)
        .where(eq(companyMember.companyId, input.companyId))

      await Promise.all(
        members.map((member) =>
          emitNotification({
            userId: member.userId,
            type: "company_reactivated",
            payload: { companyId: input.companyId, companyName: result.name },
          }),
        ),
      )

      return result
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          COMPANY_NOT_FOUND: "NOT_FOUND",
          COMPANY_INVALID_STATUS_TRANSITION: "BAD_REQUEST",
        },
        fallbackMessage: "Failed to reactivate company",
      })
    }
  })

/* ── Uploads ── */

export const uploadCompanyLogoProcedure = companyAdminProcedureStandard
  .input(
    z.object({
      file: z.file(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      const result = await uploadImageToS3({
        file: input.file,
        folder: "logos",
      })

      // Persist the logo URL to the company record immediately
      await updateCompany(context.companyMembership.companyId, {
        logoUrl: result.url,
      })
      revalidateTag(
        CACHE_TAGS.COMPANY_PROFILE(context.companyMembership.companyId),
        "max",
      )
      revalidateTag(
        CACHE_TAGS.COMPANY_PROFILE(`user-${context.user.id}`),
        "max",
      )

      return result
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
