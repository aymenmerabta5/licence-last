import { z } from "zod"

import type { TranslationFn } from "./auth"

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
