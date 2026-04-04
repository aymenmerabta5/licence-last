import "server-only"

import { ORPCError } from "@orpc/server"
import { z } from "zod"

import { verifyCodeSchema } from "@/lib/schemas/verify"
import * as rateLimitedProcedures from "@/server/orpc/rate-limited-procedures"
import { throwCodedORPCError } from "@/server/orpc/utils/service-error"
import { downloadDocument } from "@/server/services/documents/download"
import { downloadDocumentByCompany } from "@/server/services/documents/download-by-company"
import {
  generateAgreement,
  type AgreementIssuerContext,
} from "@/server/services/documents/generate-agreement"
import { generateCertificateByCompany } from "@/server/services/documents/generate-certificate-by-company"
import { isDocumentServiceError } from "@/server/services/documents/errors"
import { listDocumentsByCompany } from "@/server/services/documents/list-by-company"
import { listDocumentsByStudent } from "@/server/services/documents/list-by-student"
import { verifyDocument } from "@/server/services/documents/verify"

const {
  companyAdminProcedureGenerous,
  companyAdminProcedureStandard,
  publicProcedureStandard,
  studentProcedureGenerous,
  studentProcedureStandard,
  universityProcedureStandard,
} = rateLimitedProcedures

const companyOwnerProcedureStandard =
  rateLimitedProcedures.companyOwnerProcedureStandard ??
  rateLimitedProcedures.companyAdminProcedureStandard

function throwDocumentRouteError(
  error: unknown,
  fallbackMessage: string,
): never {
  if (error instanceof ORPCError) {
    throw error
  }

  if (isDocumentServiceError(error)) {
    if (
      error.code === "DOCUMENT_NOT_FOUND" ||
      error.code === "PLACEMENT_NOT_FOUND"
    ) {
      throwCodedORPCError("NOT_FOUND", error.code, {
        message: error.message,
      })
    }

    if (
      error.code === "DOCUMENT_FORBIDDEN" ||
      error.code === "PLACEMENT_FORBIDDEN"
    ) {
      throwCodedORPCError("FORBIDDEN", error.code, {
        message: error.message,
      })
    }

    if (error.code === "DOCUMENT_NOT_READY") {
      throwCodedORPCError("CONFLICT", error.code, {
        message: error.message,
      })
    }

    throwCodedORPCError("BAD_REQUEST", error.code, {
      message: error.message,
    })
  }

  throwCodedORPCError("BAD_REQUEST", "DOCUMENT_ROUTE_ERROR", {
    message: error instanceof Error ? error.message : fallbackMessage,
  })
}

function toAgreementIssuerContext(context: {
  user: {
    id: string
    role?: string | null
    universityId?: string | null
    departmentId?: string | null
    universityMembershipRole?: string | null
  }
}): AgreementIssuerContext {
  return {
    userId: context.user.id,
    role: context.user.role ?? null,
    universityId: context.user.universityId ?? null,
    departmentId: context.user.departmentId ?? null,
    universityMembershipRole: context.user.universityMembershipRole ?? null,
  }
}

function assertCompanyOwner(context: {
  companyMembership: { role?: string | null }
}): void {
  if (context.companyMembership.role !== "owner") {
    throwCodedORPCError("FORBIDDEN", "COMPANY_OWNER_ACCESS_REQUIRED", {
      message: "Company owner access required",
    })
  }
}

/* Generate Agreement PDF */

export const generateAgreementProcedure = universityProcedureStandard
  .input(
    z.object({
      placementId: z.string().min(1),
      locale: z.enum(["en", "fr", "ar"]).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    if (context.user.role !== "university_admin") {
      throwCodedORPCError("FORBIDDEN", "PLACEMENT_FORBIDDEN", {
        message: "You do not have access to this placement",
      })
    }

    try {
      const result = await generateAgreement({
        placementId: input.placementId,
        locale: input.locale,
        issuer: toAgreementIssuerContext(context),
      })

      return {
        success: result.success,
        documentId: result.documentId,
        pdfBase64: result.buffer?.toString("base64"),
      }
    } catch (error) {
      throwDocumentRouteError(error, "Failed to generate agreement")
    }
  })

/* Student Documents List */

export const listStudentDocumentsProcedure = studentProcedureGenerous.handler(
  async ({ context }) => listDocumentsByStudent(context.user.id),
)

/* Company Documents List */

export const listCompanyDocumentsProcedure =
  companyAdminProcedureGenerous.handler(async ({ context }) =>
    listDocumentsByCompany(context.companyMembership.companyId),
  )

/* Student Document Download */

export const downloadDocumentProcedure = studentProcedureStandard
  .input(
    z.object({
      documentId: z.string().min(1),
      locale: z.enum(["en", "fr", "ar"]).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      const result = await downloadDocument({
        documentId: input.documentId,
        studentUserId: context.user.id,
        locale: input.locale,
      })

      return {
        documentType: result.documentType,
        fileName: result.fileName,
        pdfBase64: result.buffer.toString("base64"),
      }
    } catch (error) {
      throwDocumentRouteError(error, "Failed to download document")
    }
  })

/* Company Certificate Generation */

export const generateCompanyCertificateProcedure = companyOwnerProcedureStandard
  .input(
    z.object({
      placementId: z.string().min(1),
      locale: z.enum(["en", "fr", "ar"]).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    assertCompanyOwner(context)

    try {
      const result = await generateCertificateByCompany({
        placementId: input.placementId,
        companyId: context.companyMembership.companyId,
        issuedByUserId: context.user.id,
        issuedByMembershipRole: context.companyMembership.role,
        locale: input.locale,
      })

      return {
        success: result.success,
        documentId: result.documentId,
        fileName: result.fileName,
        pdfBase64: result.buffer?.toString("base64"),
      }
    } catch (error) {
      throwDocumentRouteError(error, "Failed to generate certificate")
    }
  })

/* Company Document Download */

export const downloadCompanyDocumentProcedure = companyAdminProcedureStandard
  .input(
    z.object({
      documentId: z.string().min(1),
      locale: z.enum(["en", "fr", "ar"]).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      const result = await downloadDocumentByCompany({
        documentId: input.documentId,
        companyId: context.companyMembership.companyId,
        locale: input.locale,
      })

      return {
        documentType: result.documentType,
        fileName: result.fileName,
        pdfBase64: result.buffer.toString("base64"),
      }
    } catch (error) {
      throwDocumentRouteError(error, "Failed to download document")
    }
  })

/* Verify Document */

export const verifyDocumentProcedure = publicProcedureStandard
  .input(verifyCodeSchema)
  .handler(async ({ input }) => verifyDocument(input.code))
