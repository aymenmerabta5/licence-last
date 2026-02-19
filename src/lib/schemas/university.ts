import { z } from "zod"

import type { TranslationFn } from "@/lib/schemas/auth"

/**
 * University onboarding form schema.
 * Used during university setup step after admin email verification.
 */
export function createUniversityOnboardingSchema(t: TranslationFn) {
  return z.object({
    name: z.string().min(2, { error: t("universityNameMin") }),
    abbreviation: z.string().optional(),
    phone: z.string().optional(),
    wilayaCode: z.coerce
      .number()
      .int()
      .min(1, { error: t("wilayaRequired") })
      .max(58, { error: t("wilayaInvalid") }),
    city: z.string().optional(),
    address: z.string().optional(),
    domains: z.array(z.string().min(3)).min(1, { error: t("domainsRequired") }),
    departments: z.array(z.object({ name: z.string().min(2) })).optional(),
  })
}

/**
 * University profile update schema.
 * Used by super admin edit dialog in universities dashboard.
 */
export function createUniversityUpdateSchema(t: TranslationFn) {
  return z.object({
    name: z.string().min(2, { error: t("universityNameMin") }),
    abbreviation: z.string().optional(),
    phone: z.string().optional(),
    wilayaCode: z.coerce
      .number()
      .int()
      .min(1, { error: t("wilayaRequired") })
      .max(58, { error: t("wilayaInvalid") })
      .optional(),
    city: z.string().optional(),
    address: z.string().optional(),
  })
}
