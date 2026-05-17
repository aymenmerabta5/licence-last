import { z } from "zod"

import {
  hasDuplicateLanguageCodes,
  LANGUAGE_CODES,
} from "@/lib/constants/languages"
import type { TranslationFn } from "@/lib/schemas/auth"

interface StudentProfileSchemaOptions {
  requireLanguages?: boolean
}

/**
 * Student profile onboarding form schema.
 * Used during the student onboarding step and for profile editing.
 */
export function createStudentProfileSchema(
  t: TranslationFn,
  options: StudentProfileSchemaOptions = {},
) {
  const studentLanguageSchema = z.object({
    languageCode: z.enum(LANGUAGE_CODES, {
      error: t("languageCodeInvalid"),
    }),
    proficiency: z.enum(
      ["a1", "a2", "b1", "b2", "c1", "c2", "native"] as const,
      {
        error: t("proficiencyInvalid"),
      },
    ),
  })
  const requireLanguages = options.requireLanguages ?? true
  const languagesSchema = requireLanguages
    ? z.array(studentLanguageSchema).min(1, { error: t("studentLanguagesMin") })
    : z.array(studentLanguageSchema)

  return z
    .object({
      bio: z.string().optional(),
      phone: z.string().optional(),
      githubUrl: z
        .string()
        .url({ error: t("githubUrlInvalid") })
        .optional()
        .or(z.literal("")),
      portfolioUrl: z
        .string()
        .url({ error: t("portfolioUrlInvalid") })
        .optional()
        .or(z.literal("")),
      studentNumber: z.string().optional(),
      department: z.string().optional(),
      level: z.string().optional(),
      wilayaCode: z.coerce
        .number()
        .int()
        .min(1, { error: t("wilayaRequired") })
        .max(58, { error: t("wilayaInvalid") })
        .optional()
        .or(z.literal(0)),
      address: z.string().optional(),
      skillTagIds: z
        .array(z.string())
        .min(1, { error: t("skillsMin") })
        .max(10, { error: t("skillsMax") }),
      languages: languagesSchema,
    })
    .superRefine((data, ctx) => {
      if (hasDuplicateLanguageCodes(data.languages)) {
        ctx.addIssue({
          code: "custom",
          message: t("languageDuplicate"),
          path: ["languages"],
        })
      }
    })
}

/**
 * Student profile details schema for settings page.
 * Lighter subset without skills/languages, includes name.
 */
export function createStudentProfileDetailsSchema(t: TranslationFn) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, { error: t("nameMin") })
      .max(120),
    bio: z.string().optional(),
    phone: z.string().optional(),
    githubUrl: z
      .string()
      .url({ error: t("githubUrlInvalid") })
      .optional()
      .or(z.literal("")),
    portfolioUrl: z
      .string()
      .url({ error: t("portfolioUrlInvalid") })
      .optional()
      .or(z.literal("")),
    studentNumber: z.string().optional(),
    department: z.string().optional(),
    level: z.string().optional(),
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
