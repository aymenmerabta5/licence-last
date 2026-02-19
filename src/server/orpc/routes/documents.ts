import "server-only"

import { ORPCError } from "@orpc/server"
import { z } from "zod"

import { verifyCodeSchema } from "@/lib/schemas/verify"
import {
  adminProcedureStandard,
  companyAdminProcedureGenerous,
  companyAdminProcedureStandard,
  publicProcedureStandard,
  studentProcedureGenerous,
  studentProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { downloadDocument } from "@/server/services/documents/download"
import { downloadDocumentByCompany } from "@/server/services/documents/download-by-company"
import { generateAgreement } from "@/server/services/documents/generate-agreement"
import { generateCertificateByCompany } from "@/server/services/documents/generate-certificate-by-company"
import { listDocumentsByCompany } from "@/server/services/documents/list-by-company"
import { listDocumentsByStudent } from "@/server/services/documents/list-by-student"
import { verifyDocument } from "@/server/services/documents/verify"

/* -- Generate Agreement PDF (admin only) -- */

export const generateAgreementProcedure = adminProcedureStandard
  .input(
    z.object({
      placementId: z.string().min(1),
      locale: z.enum(["en", "fr", "ar"]).optional(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      const result = await generateAgreement({
        placementId: input.placementId,
        locale: input.locale,
      })

      return {
        success: result.success,
        documentId: result.documentId,
        pdfBase64: result.buffer?.toString("base64"),
      }
    } catch (error) {
      if (error instanceof ORPCError) throw error
      throw new ORPCError("BAD_REQUEST", {
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate agreement",
      })
    }
  })

/* -- Student Documents List -- */

export const listStudentDocumentsProcedure = studentProcedureGenerous.handler(
  async ({ context }) => listDocumentsByStudent(context.user.id),
)

/* -- Company Documents List -- */

export const listCompanyDocumentsProcedure =
  companyAdminProcedureGenerous.handler(async ({ context }) =>
    listDocumentsByCompany(context.companyMembership.companyId),
  )

/* -- Student Document Download -- */

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
      if (error instanceof ORPCError) throw error

      if (error instanceof Error) {
        if (error.message === "Document not found") {
          throw new ORPCError("NOT_FOUND", { message: error.message })
        }
        if (error.message === "You do not have access to this document") {
          throw new ORPCError("FORBIDDEN", { message: error.message })
        }
      }

      throw new ORPCError("BAD_REQUEST", {
        message:
          error instanceof Error
            ? error.message
            : "Failed to download document",
      })
    }
  })

/* -- Company Certificate Generation -- */

export const generateCompanyCertificateProcedure = companyAdminProcedureStandard
  .input(
    z.object({
      placementId: z.string().min(1),
      locale: z.enum(["en", "fr", "ar"]).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      const result = await generateCertificateByCompany({
        placementId: input.placementId,
        companyId: context.companyMembership.companyId,
        issuedByUserId: context.user.id,
        locale: input.locale,
      })

      return {
        success: result.success,
        documentId: result.documentId,
        fileName: result.fileName,
        pdfBase64: result.buffer?.toString("base64"),
      }
    } catch (error) {
      if (error instanceof ORPCError) throw error

      if (error instanceof Error) {
        if (error.message === "Placement not found") {
          throw new ORPCError("NOT_FOUND", { message: error.message })
        }
        if (error.message === "You do not have access to this placement") {
          throw new ORPCError("FORBIDDEN", { message: error.message })
        }
      }

      throw new ORPCError("BAD_REQUEST", {
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate certificate",
      })
    }
  })

/* -- Company Document Download -- */

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
      if (error instanceof ORPCError) throw error

      if (error instanceof Error) {
        if (error.message === "Document not found") {
          throw new ORPCError("NOT_FOUND", { message: error.message })
        }
        if (error.message === "You do not have access to this document") {
          throw new ORPCError("FORBIDDEN", { message: error.message })
        }
      }

      throw new ORPCError("BAD_REQUEST", {
        message:
          error instanceof Error
            ? error.message
            : "Failed to download document",
      })
    }
  })

/* -- Verify Document (public) -- */

export const verifyDocumentProcedure = publicProcedureStandard
  .input(verifyCodeSchema)
  .handler(async ({ input }) => verifyDocument(input.code))
