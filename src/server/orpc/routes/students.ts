import "server-only"

import { ORPCError } from "@orpc/server"
import { revalidateTag } from "next/cache"
import { z } from "zod"
import { CACHE_TAGS } from "@/lib/cache"
import {
  hasDuplicateLanguageCodes,
  LANGUAGE_CODES,
} from "@/lib/constants/languages"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { proficiencyLevelSchema } from "@/lib/schemas/enums"
import {
  authedProcedureGenerous,
  studentProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { getStudentProfile } from "@/server/services/students/get-profile"
import { getPublicStudentProfile } from "@/server/services/students/get-public-profile"
import { upsertStudentProfile } from "@/server/services/students/upsert-profile"
import { upsertStudentProfileDetails } from "@/server/services/students/upsert-profile-details"

/* ── Reads ── */

export const getStudentProfileProcedure = authedProcedureGenerous
  .input(
    z
      .object({
        userId: z.string().min(1),
      })
      .optional(),
  )
  .handler(async ({ input, context }) => {
    const targetUserId = input?.userId ?? context.user.id

    // Students can only view their own profile.
    // Admins/super_admins can view any profile.
    const isAdmin =
      context.user.role === "university_admin" ||
      context.user.role === "super_admin"
    if (targetUserId !== context.user.id && !isAdmin) {
      throw new ORPCError("FORBIDDEN", {
        message: "You can only view your own profile",
      })
    }

    return getStudentProfile(targetUserId)
  })

export const getPublicStudentProfileProcedure = authedProcedureGenerous
  .input(
    z.object({
      userId: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    const isAdmin =
      context.user.role === "university_admin" ||
      context.user.role === "super_admin"
    const isCompanyAdmin = context.user.role === "company_admin"
    const isStudentOwner =
      context.user.role === "student" && input.userId === context.user.id

    if (!isAdmin && !isCompanyAdmin && !isStudentOwner) {
      throw new ORPCError("FORBIDDEN", {
        message: "You do not have access to this profile",
      })
    }

    return getPublicStudentProfile(
      { id: context.user.id, role: context.user.role },
      input.userId,
    )
  })

/* ── Mutations ── */

export const upsertStudentProfileProcedure = studentProcedureStandard
  .input(
    z.object({
      bio: z.string().optional(),
      phone: z.string().optional(),
      githubUrl: z.string().url().optional().or(z.literal("")),
      portfolioUrl: z.string().url().optional().or(z.literal("")),
      studentNumber: z.string().optional(),
      department: z.string().optional(),
      departmentId: z.string().optional(),
      level: z.string().optional(),
      wilayaCode: z.coerce
        .number()
        .int()
        .min(1)
        .max(58)
        .optional()
        .or(z.literal(0)),
      address: z.string().optional(),
      skillTagIds: z.array(z.string()).min(1).max(10),
      languages: z
        .array(
          z.object({
            languageCode: z.enum(LANGUAGE_CODES),
            proficiency: proficiencyLevelSchema,
          }),
        )
        .optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    const { skillTagIds, languages, ...data } = input
    const isLanguageRequirementsEnabled = isFeatureEnabled(
      "LANGUAGE_REQUIREMENTS",
    )

    if (isLanguageRequirementsEnabled) {
      if (!languages || languages.length === 0) {
        throw new ORPCError("BAD_REQUEST", {
          message: "At least one language is required",
        })
      }

      if (hasDuplicateLanguageCodes(languages)) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Duplicate languages are not allowed",
        })
      }
    }

    const result = await upsertStudentProfile(
      data,
      skillTagIds,
      context.user.id,
      isLanguageRequirementsEnabled ? (languages ?? []) : undefined,
    )

    // Invalidate profile caches after update
    revalidateTag(CACHE_TAGS.STUDENT_PROFILE(context.user.id), "max")
    revalidateTag(CACHE_TAGS.PUBLIC_PROFILE(context.user.id), "max")
    revalidateTag(CACHE_TAGS.STUDENT_STATS(context.user.id), "max")

    return result
  })

export const upsertStudentProfileDetailsProcedure = studentProcedureStandard
  .input(
    z.object({
      bio: z.string().optional(),
      phone: z.string().optional(),
      githubUrl: z.string().url().optional().or(z.literal("")),
      portfolioUrl: z.string().url().optional().or(z.literal("")),
      studentNumber: z.string().optional(),
      department: z.string().optional(),
      level: z.string().optional(),
      wilayaCode: z.coerce
        .number()
        .int()
        .min(1)
        .max(58)
        .optional()
        .or(z.literal(0)),
      address: z.string().optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    const result = await upsertStudentProfileDetails(input, context.user.id)

    // Invalidate profile caches after update
    revalidateTag(CACHE_TAGS.STUDENT_PROFILE(context.user.id), "max")
    revalidateTag(CACHE_TAGS.PUBLIC_PROFILE(context.user.id), "max")

    return result
  })
