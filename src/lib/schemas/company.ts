import { z } from "zod"

import type { TranslationFn } from "@/lib/schemas/auth"
import { companyReportSeveritySchema } from "@/lib/schemas/enums"

/**
 * Company onboarding form schema.
 * Used during the company setup step after email verification.
 */
export function createCompanyOnboardingSchema(t: TranslationFn) {
  return z.object({
    name: z.string().min(2, { error: t("companyNameMin") }),
    description: z.string().optional(),
    websiteUrl: z
      .string()
      .url({ error: t("websiteUrlInvalid") })
      .optional()
      .or(z.literal("")),
    wilayaCode: z.coerce
      .number()
      .int()
      .min(1, { error: t("wilayaRequired") })
      .max(58, { error: t("wilayaInvalid") }),
    address: z.string().optional(),
  })
}

export const companyQualityFeedbackSchema = z.object({
  placementId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  wouldRecommend: z.boolean().default(false),
  comment: z.string().max(2000).optional(),
})

export const companyReportSchema = z.object({
  companyId: z.string().min(1),
  category: z.string().min(1).max(100),
  severity: companyReportSeveritySchema.default("medium"),
  description: z.string().min(10).max(4000),
})

export const resolveCompanyReportSchema = z.object({
  reportId: z.string().min(1),
  status: z.enum(["resolved", "dismissed"]),
  resolutionNote: z.string().max(2000).optional(),
})
