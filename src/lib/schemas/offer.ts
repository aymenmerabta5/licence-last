import { z } from "zod"

import type { TranslationFn } from "./auth"

/**
 * Internship offer form schema.
 * Used for creating and editing internship offers.
 */
export function createOfferSchema(t: TranslationFn) {
  return z.object({
    title: z.string().min(3, { error: t("offerTitleMin") }),
    description: z.string().min(10, { error: t("offerDescriptionMin") }),
    internshipType: z.enum(["pfe", "immersion", "summer", "practical"], {
      error: t("internshipTypeRequired"),
    }),
    workMode: z
      .enum(["on_site", "hybrid", "remote"])
      .optional(),
    wilayaCode: z.coerce
      .number()
      .int()
      .min(1, { error: t("wilayaRequired") })
      .max(58, { error: t("wilayaInvalid") })
      .optional()
      .or(z.literal(0)),
    durationWeeks: z.coerce
      .number()
      .int()
      .min(1, { error: t("durationWeeksMin") })
      .max(52, { error: t("durationWeeksMax") })
      .optional()
      .or(z.literal(0)),
    maxPositions: z.coerce
      .number()
      .int()
      .min(1, { error: t("maxPositionsMin") })
      .max(100, { error: t("maxPositionsMax") })
      .optional()
      .or(z.literal(0)),
    skillTagIds: z
      .array(z.string())
      .max(20, { error: t("offerSkillsMax") }),
  })
}

/**
 * Company profile edit schema.
 * Used for updating company details after onboarding.
 */
export function createCompanyProfileSchema(t: TranslationFn) {
  return z.object({
    description: z.string().optional(),
    logoUrl: z
      .string()
      .url({ error: t("websiteUrlInvalid") })
      .optional()
      .or(z.literal("")),
    websiteUrl: z
      .string()
      .url({ error: t("websiteUrlInvalid") })
      .optional()
      .or(z.literal("")),
    phone: z.string().optional(),
    contactEmail: z
      .email({ error: t("emailInvalid") })
      .optional()
      .or(z.literal("")),
    representativeName: z.string().optional(),
    wilayaCode: z.coerce
      .number()
      .int()
      .min(1, { error: t("wilayaRequired") })
      .max(58, { error: t("wilayaInvalid") })
      .optional()
      .or(z.literal(0)),
    address: z.string().optional(),
  })
}
