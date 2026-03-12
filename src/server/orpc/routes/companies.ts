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
import { searchCompaniesForStudentsSchema } from "@/lib/schemas/search"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { companyMember } from "@/server/db/schema/companies"
import CompanyApprovedEmail from "@/server/email/templates/CompanyApprovedEmail"
import CompanyRejectedEmail from "@/server/email/templates/CompanyRejectedEmail"
import { isAdminRole } from "@/server/orpc/middleware"
import * as rateLimitedProcedures from "@/server/orpc/rate-limited-procedures"
import { createServiceORPCError } from "@/server/orpc/utils/service-error"
import { approveCompany } from "@/server/services/companies/approve"
import { createCompany } from "@/server/services/companies/create"
import { deleteCompany } from "@/server/services/companies/delete"
import { downloadCompanyVerificationDocument } from "@/server/services/companies/download-verification-document"
import { getCompanyById } from "@/server/services/companies/get"
import { inviteCompanyMember } from "@/server/services/companies/invite-member"
import { listCompanies } from "@/server/services/companies/list"
import { listCompanyMembers } from "@/server/services/companies/list-members"
import { listPublicDirectoryCompanies } from "@/server/services/companies/list-public-directory"
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
import { uploadCompanyVerificationDocument } from "@/server/services/uploads/upload-company-verification-document"
import { uploadImageToS3 } from "@/server/services/uploads/upload-image"
import { deleteFile } from "@/server/storage/s3"

const {
  authedProcedureGenerous,
  authedProcedureStandard,
  studentProcedureGenerous,
  superAdminProcedureGenerous,
  superAdminProcedureStandard,
} = rateLimitedProcedures

const companyOwnerProcedureStandard =
  rateLimitedProcedures.companyOwnerProcedureStandard ??
  rateLimitedProcedures.companyAdminProcedureStandard
const companyOwnerProcedureGenerous =
  rateLimitedProcedures.companyOwnerProcedureGenerous ??
  rateLimitedProcedures.companyAdminProcedureGenerous

function assertCompanyOwner(context: {
  companyMembership: { role?: string | null }
}): void {
  if (context.companyMembership.role !== "owner") {
    throw new ORPCError("FORBIDDEN", {
      message: "Company owner access required",
    })
  }
}

/* â”€â”€ Reads â”€â”€ */

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

export const listPublicDirectoryProcedure = studentProcedureGenerous
  .input(searchCompaniesForStudentsSchema)
  .handler(async ({ input }) => listPublicDirectoryCompanies(input))

export const getCompanyByIdProcedure = authedProcedureGenerous
  .input(z.object({ companyId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    const company = await getCompanyById(input.companyId)
    if (!company) return null

    const isAdmin = isAdminRole(context.user.role)

    let isOwner = false
    if (context.user.role === "company_admin") {
      const membership = await getCompanyMembership(context.user.id)
      isOwner =
        membership?.companyId === company.id && membership.role === "owner"
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
      const result = await submitCompanyQualityFeedback({
        studentUserId: context.user.id,
        ...input,
      })
      revalidateTag(CACHE_TAGS.COMPANY_PROFILE(result.companyId), "max")
      revalidateTag(CACHE_TAGS.COMPANY_CANDIDATES(result.companyId), {
        expire: 0,
      })
      return result
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
          message:
            "Company admins cannot submit reports against their own company",
        })
      }
    }

    try {
      const result = await submitCompanyReport({
        reporterUserId: context.user.id,
        ...input,
      })
      revalidateTag(CACHE_TAGS.COMPANY_PROFILE(input.companyId), "max")
      revalidateTag(CACHE_TAGS.COMPANY_CANDIDATES(input.companyId), {
        expire: 0,
      })
      return result
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          COMPANY_REPORT_RELATIONSHIP_REQUIRED: "FORBIDDEN",
          COMPANY_REPORT_DESCRIPTION_REQUIRED: "BAD_REQUEST",
        },
        fallbackMessage: "Failed to submit company report",
      })
    }
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
  companyOwnerProcedureGenerous.handler(async ({ context }) => {
    assertCompanyOwner(context)
    return listCompanyMembers(context.companyMembership.companyId)
  })

export const downloadCompanyVerificationDocumentProcedure =
  superAdminProcedureStandard
    .input(z.object({ companyId: z.string().min(1) }))
    .handler(async ({ input }) => {
      try {
        const result = await downloadCompanyVerificationDocument(
          input.companyId,
        )
        return {
          fileName: result.fileName,
          mimeType: result.mimeType,
          fileBase64: result.buffer.toString("base64"),
        }
      } catch (error) {
        createServiceORPCError(error, {
          codeMap: {
            COMPANY_NOT_FOUND: "NOT_FOUND",
            COMPANY_VERIFICATION_DOCUMENT_NOT_FOUND: "NOT_FOUND",
            STORAGE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
          },
          fallbackMessage: "Failed to download company verification document",
        })
      }
    })

/* â”€â”€ Mutations â”€â”€ */

function revalidateAfterCompanyDeletion(
  companyId: string,
  affectedUserIds: string[],
) {
  revalidateTag(CACHE_TAGS.COMPANY_PROFILE(companyId), "max")
  revalidateTag(CACHE_TAGS.COMPANY_OFFERS(companyId), { expire: 0 })
  revalidateTag(CACHE_TAGS.COMPANY_CANDIDATES(companyId), { expire: 0 })
  revalidateTag(CACHE_TAGS.OFFER_SEARCH, { expire: 0 })
  revalidateTag(CACHE_TAGS.OFFERS_PUBLIC, { expire: 0 })
  revalidateTag(CACHE_TAGS.COMPANIES_DIRECTORY, { expire: 0 })

  for (const affectedUserId of affectedUserIds) {
    revalidateTag(CACHE_TAGS.COMPANY_PROFILE(`user-${affectedUserId}`), "max")
  }
}

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
      verificationDocument: z.file(),
    }),
  )
  .handler(async ({ input, context }) => {
    let uploadedDocumentKey: string | null = null

    try {
      const uploadedDocument = await uploadCompanyVerificationDocument({
        file: input.verificationDocument,
        userId: context.user.id,
      })
      uploadedDocumentKey = uploadedDocument.key

      const result = await createCompany(
        {
          name: input.name,
          description: input.description,
          websiteUrl: input.websiteUrl,
          wilayaCode: input.wilayaCode,
          address: input.address,
          verificationDocument: uploadedDocument,
        },
        context.user.id,
      )

      revalidateTag(CACHE_TAGS.COMPANY_PROFILE(result.companyId), "max")
      revalidateTag(
        CACHE_TAGS.COMPANY_PROFILE(`user-${context.user.id}`),
        "max",
      )
      revalidateTag(CACHE_TAGS.COMPANIES_DIRECTORY, { expire: 0 })

      return result
    } catch (error) {
      if (uploadedDocumentKey) {
        try {
          await deleteFile(uploadedDocumentKey)
        } catch {
          // Company creation failed; cleanup should not mask the root error.
        }
      }

      const message = error instanceof Error ? error.message : ""
      if (
        message.startsWith("Verification document must be") ||
        message.startsWith("Verification document file size") ||
        message.startsWith("File content does not match declared document type")
      ) {
        throw new ORPCError("BAD_REQUEST", { message })
      }

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
    assertCompanyOwner(context)

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
    assertCompanyOwner(context)

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

export const updateCompanyProcedure = companyOwnerProcedureStandard
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
    assertCompanyOwner(context)

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
      revalidateTag(CACHE_TAGS.COMPANIES_DIRECTORY, { expire: 0 })

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
    revalidateTag(CACHE_TAGS.COMPANIES_DIRECTORY, { expire: 0 })

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
            subject: `${result.name} has been approved - Stag`,
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
    revalidateTag(CACHE_TAGS.COMPANIES_DIRECTORY, { expire: 0 })

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
            subject: `Update on your ${result.name} application - Stag`,
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
      revalidateTag(CACHE_TAGS.COMPANIES_DIRECTORY, { expire: 0 })

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
      revalidateTag(CACHE_TAGS.COMPANIES_DIRECTORY, { expire: 0 })

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

/* â”€â”€ Uploads â”€â”€ */

export const deleteCompanyProcedure = superAdminProcedureStandard
  .input(z.object({ companyId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    try {
      const result = await deleteCompany(input.companyId, context.user.id)

      if (result.verificationDocumentKey) {
        try {
          await deleteFile(result.verificationDocumentKey)
        } catch {
          // Database deletion succeeded; S3 cleanup failure should be non-blocking.
        }
      }

      revalidateAfterCompanyDeletion(result.companyId, result.affectedUserIds)

      return {
        success: result.success,
        companyId: result.companyId,
        companyName: result.companyName,
        affectedUsers: result.affectedUserIds.length,
      }
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          COMPANY_NOT_FOUND: "NOT_FOUND",
        },
        fallbackMessage: "Failed to delete company",
      })
    }
  })

export const deleteOwnCompanyProcedure = companyOwnerProcedureStandard
  .input(z.object({}))
  .handler(async ({ context }) => {
    assertCompanyOwner(context)

    try {
      const result = await deleteCompany(
        context.companyMembership.companyId,
        context.user.id,
      )

      if (result.verificationDocumentKey) {
        try {
          await deleteFile(result.verificationDocumentKey)
        } catch {
          // Database deletion succeeded; S3 cleanup failure should be non-blocking.
        }
      }

      revalidateAfterCompanyDeletion(result.companyId, result.affectedUserIds)

      return {
        success: result.success,
        companyId: result.companyId,
        companyName: result.companyName,
        affectedUsers: result.affectedUserIds.length,
      }
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          COMPANY_NOT_FOUND: "NOT_FOUND",
        },
        fallbackMessage: "Failed to delete company",
      })
    }
  })

export const uploadCompanyLogoProcedure = companyOwnerProcedureStandard
  .input(
    z.object({
      file: z.file(),
    }),
  )
  .handler(async ({ input, context }) => {
    assertCompanyOwner(context)

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
      revalidateTag(CACHE_TAGS.COMPANIES_DIRECTORY, { expire: 0 })

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
