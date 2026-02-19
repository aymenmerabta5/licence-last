import { z } from "zod"

import {
  DEFAULT_OFFER_LANGUAGE_REQUIRED,
  DEFAULT_OFFER_LANGUAGE_WEIGHT,
  hasDuplicateLanguageCodes,
  LANGUAGE_CODES,
} from "@/lib/constants/languages"
import type { TranslationFn } from "@/lib/schemas/auth"
import {
  internshipTypeSchema,
  proficiencyLevelSchema,
  workModeSchema,
} from "@/lib/schemas/enums"

function parseDateOnly(value: string): Date | null {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed
}

const offerLanguageRequirementSchema = z.object({
  languageCode: z.enum(LANGUAGE_CODES),
  minimumProficiency: proficiencyLevelSchema,
  isRequired: z.boolean().default(DEFAULT_OFFER_LANGUAGE_REQUIRED),
  weight: z.coerce
    .number()
    .int()
    .min(1)
    .max(5)
    .default(DEFAULT_OFFER_LANGUAGE_WEIGHT),
})

interface OfferSchemaOptions {
  requireLanguageRequirements?: boolean
}

/**
 * Internship offer form schema.
 * Used for creating and editing internship offers.
 */
export function createOfferSchema(
  t: TranslationFn,
  options: OfferSchemaOptions = {},
) {
  const requireLanguageRequirements =
    options.requireLanguageRequirements ?? true
  const languageRequirementsSchema = requireLanguageRequirements
    ? z
        .array(offerLanguageRequirementSchema)
        .min(1, { error: t("offerLanguageRequirementsMin") })
    : z.array(offerLanguageRequirementSchema)

  return z
    .object({
      title: z.string().min(3, { error: t("offerTitleMin") }),
      description: z.string().min(10, { error: t("offerDescriptionMin") }),
      internshipType: internshipTypeSchema,
      workMode: workModeSchema.optional(),
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
      applicationDeadlineAt: z.string().optional().or(z.literal("")),
      expectedStartDate: z.string().optional().or(z.literal("")),
      expectedEndDate: z.string().optional().or(z.literal("")),
      skillTagIds: z.array(z.string()).max(20, { error: t("offerSkillsMax") }),
      languageRequirements: languageRequirementsSchema,
    })
    .superRefine((data, ctx) => {
      const applicationDeadlineAt = data.applicationDeadlineAt || undefined
      const expectedStartDate = data.expectedStartDate || undefined
      const expectedEndDate = data.expectedEndDate || undefined

      const parsedDeadline = applicationDeadlineAt
        ? parseDateOnly(applicationDeadlineAt)
        : null
      const parsedStart = expectedStartDate
        ? parseDateOnly(expectedStartDate)
        : null
      const parsedEnd = expectedEndDate ? parseDateOnly(expectedEndDate) : null

      if (applicationDeadlineAt && !parsedDeadline) {
        ctx.addIssue({
          code: "custom",
          message: t("dateInvalid"),
          path: ["applicationDeadlineAt"],
        })
      }

      if (expectedStartDate && !parsedStart) {
        ctx.addIssue({
          code: "custom",
          message: t("dateInvalid"),
          path: ["expectedStartDate"],
        })
      }

      if (expectedEndDate && !parsedEnd) {
        ctx.addIssue({
          code: "custom",
          message: t("dateInvalid"),
          path: ["expectedEndDate"],
        })
      }

      if (
        (expectedStartDate && !expectedEndDate) ||
        (!expectedStartDate && expectedEndDate)
      ) {
        ctx.addIssue({
          code: "custom",
          message: t("expectedPeriodBothRequired"),
          path: ["expectedEndDate"],
        })
      }

      if (parsedStart && parsedEnd && parsedStart >= parsedEnd) {
        ctx.addIssue({
          code: "custom",
          message: t("expectedPeriodInvalid"),
          path: ["expectedEndDate"],
        })
      }

      if (parsedDeadline && parsedStart && parsedDeadline > parsedStart) {
        ctx.addIssue({
          code: "custom",
          message: t("deadlineAfterExpectedStart"),
          path: ["applicationDeadlineAt"],
        })
      }

      if (hasDuplicateLanguageCodes(data.languageRequirements)) {
        ctx.addIssue({
          code: "custom",
          message: t("languageDuplicate"),
          path: ["languageRequirements"],
        })
      }
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
