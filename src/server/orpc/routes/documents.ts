import { z } from "zod"
import { ORPCError } from "@orpc/server"

import { adminProcedure } from "../middleware"
import { generateAgreement } from "@/server/services/documents/generate-agreement"

/* ── Generate Agreement PDF (admin only) ── */

export const generateAgreementProcedure = adminProcedure
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

      // Return base64 encoded PDF for download
      return {
        success: result.success,
        documentId: result.documentId,
        // Return as base64 for client download
        pdfBase64: result.buffer?.toString("base64"),
      }
    } catch (error) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message:
          error instanceof Error ? error.message : "Failed to generate agreement",
      })
    }
  })
