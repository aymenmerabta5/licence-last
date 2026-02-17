import { z } from "zod"

import type { TranslationFn } from "@/lib/schemas/auth"

/**
 * Student profile onboarding form schema.
 * Used during the student onboarding step and for profile editing.
 */
export function createStudentProfileSchema(t: TranslationFn) {
  return z.object({
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
  })
}
