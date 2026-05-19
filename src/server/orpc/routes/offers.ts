import "server-only"

import { ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { z } from "zod"
import { CACHE_TAGS } from "@/lib/cache"
import {
  hasDuplicateLanguageCodes,
  LANGUAGE_CODES,
} from "@/lib/constants/languages"
import { isFeatureEnabled } from "@/lib/feature-flags"
import {
  internshipTypeSchema,
  proficiencyLevelSchema,
  workModeSchema,
} from "@/lib/schemas/enums"
import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import { isAdminRole } from "@/server/orpc/authz"
import {
  authedProcedureGenerous,
  authedProcedureStrict,
  companyAdminProcedureAssistant,
  companyAdminProcedureGenerous,
  companyAdminProcedureStandard,
  studentProcedureGenerous,
  studentProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { throwAIOrpcError } from "@/server/orpc/utils/ai-error"
import { parseInputDate } from "@/server/orpc/utils/date"
import { createServiceORPCError } from "@/server/orpc/utils/service-error"
import { checkOfferSaved } from "@/server/services/offers/check-saved"
import { createOffer } from "@/server/services/offers/create"
import { deleteOffer } from "@/server/services/offers/delete"
import { getOfferById } from "@/server/services/offers/get"
import { listOffersByCompany } from "@/server/services/offers/list-by-company"
import { listSavedOffers } from "@/server/services/offers/list-saved"
import { saveOffer } from "@/server/services/offers/save"
import { unsaveOffer } from "@/server/services/offers/unsave"
import { updateOffer } from "@/server/services/offers/update"
import { updateOfferStatus } from "@/server/services/offers/update-status"

function parseOptionalDate(
  value: string | null | undefined,
  fieldLabel: string,
): Date | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  return parseInputDate(value, fieldLabel)
}

function validateOfferTiming(
  fields: {
    applicationDeadlineAt?: Date | null
    expectedStartDate?: Date | null
    expectedEndDate?: Date | null
  },
  requireExpectedPair: boolean,
) {
  const { applicationDeadlineAt, expectedStartDate, expectedEndDate } = fields

  if (
    requireExpectedPair &&
    ((expectedStartDate && !expectedEndDate) ||
      (!expectedStartDate && expectedEndDate))
  ) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Expected start and end dates must both be provided",
    })
  }

  if (
    expectedStartDate &&
    expectedEndDate &&
    expectedStartDate >= expectedEndDate
  ) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Expected start date must be before expected end date",
    })
  }

  if (
    applicationDeadlineAt &&
    expectedStartDate &&
    applicationDeadlineAt > expectedStartDate
  ) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Application deadline must be before expected start date",
    })
  }
}

const languageRequirementSchema = z.object({
  languageCode: z.enum(LANGUAGE_CODES),
  minimumProficiency: proficiencyLevelSchema,
  isRequired: z.boolean().default(true),
  weight: z.coerce.number().int().min(1).max(5).default(1),
})

function assertSavedOffersEnabled() {
  if (!isFeatureEnabled("SAVED_OFFERS")) {
    throw new ORPCError("FORBIDDEN", {
      message: "Saved offers feature is disabled",
    })
  }
}

/* ── Reads ── */

export const getOfferByIdProcedure = authedProcedureGenerous
  .input(z.object({ offerId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    const offer = await getOfferById(input.offerId)
    if (!offer) return null

    async function getViewerCompanyMembership() {
      const memberships = await db
        .select()
        .from(companyMember)
        .where(eq(companyMember.userId, context.user.id))
        .limit(2)

      if (memberships.length > 1) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Multiple company memberships found for user",
        })
      }

      return memberships[0] ?? null
    }

    const isAdmin = isAdminRole(
      context.user.role,
      context.user.universityMembershipRole,
    )

    // Student-facing visibility requires an approved company.
    // Company admins can still access their own offers.
    if (!isAdmin && offer.companyStatus !== "approved") {
      const membership = await getViewerCompanyMembership()
      if (!membership || membership.companyId !== offer.companyId) {
        throw new ORPCError("FORBIDDEN", {
          message: "You do not have access to this offer",
        })
      }
    }

    // Draft/closed offers are only visible to the owning company or admins.
    if (offer.status !== "published" && !isAdmin) {
      const membership = await getViewerCompanyMembership()
      if (!membership || membership.companyId !== offer.companyId) {
        throw new ORPCError("FORBIDDEN", {
          message: "You do not have access to this offer",
        })
      }
    }

    return offer
  })

export const listOffersByCompanyProcedure =
  companyAdminProcedureGenerous.handler(async ({ context }) =>
    listOffersByCompany(context.companyMembership.companyId),
  )

export const listSavedOffersProcedure = studentProcedureGenerous
  .input(
    z
      .object({
        cursor: z
          .object({
            savedAt: z.string().datetime(),
            offerId: z.string().min(1),
          })
          .optional(),
        limit: z.coerce.number().int().min(1).max(50).optional(),
      })
      .optional(),
  )
  .handler(async ({ input, context }) => {
    assertSavedOffersEnabled()
    return listSavedOffers(context.user.id, input)
  })

export const checkOfferSavedProcedure = studentProcedureGenerous
  .input(z.object({ offerId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    assertSavedOffersEnabled()
    return checkOfferSaved(input.offerId, context.user.id)
  })

export const saveOfferProcedure = studentProcedureStandard
  .input(z.object({ offerId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    assertSavedOffersEnabled()
    try {
      const result = await saveOffer(input.offerId, context.user.id)
      revalidateTag(CACHE_TAGS.STUDENT_STATS(context.user.id), { expire: 0 })
      return result
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          OFFER_NOT_FOUND: "NOT_FOUND",
          OFFER_NOT_SAVABLE: "BAD_REQUEST",
        },
        fallbackMessage: "Failed to save offer",
      })
    }
  })

export const unsaveOfferProcedure = studentProcedureStandard
  .input(z.object({ offerId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    assertSavedOffersEnabled()
    const result = await unsaveOffer(input.offerId, context.user.id)
    revalidateTag(CACHE_TAGS.STUDENT_STATS(context.user.id), { expire: 0 })
    return result
  })
/* ── Mutations ── */

export const createOfferProcedure = companyAdminProcedureStandard
  .input(
    z.object({
      title: z.string().min(3),
      description: z.string().min(10),
      internshipType: internshipTypeSchema,
      workMode: workModeSchema,
      wilayaCode: z.coerce.number().int().min(1).max(58),
      durationWeeks: z.coerce.number().int().min(1).max(52),
      maxPositions: z.coerce.number().int().min(1).max(100),
      applicationDeadlineAt: z.string().min(1),
      expectedStartDate: z.string().min(1),
      expectedEndDate: z.string().min(1),
      skillTagIds: z.array(z.string()).min(1).max(20),
      languageRequirements: z.array(languageRequirementSchema).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    const {
      applicationDeadlineAt: applicationDeadlineAtInput,
      expectedStartDate: expectedStartDateInput,
      expectedEndDate: expectedEndDateInput,
      languageRequirements,
      ...restInput
    } = input

    let applicationDeadlineAt: Date
    let expectedStartDate: Date
    let expectedEndDate: Date

    try {
      applicationDeadlineAt = parseInputDate(
        applicationDeadlineAtInput,
        "Application deadline",
      )
      expectedStartDate = parseInputDate(
        expectedStartDateInput,
        "Expected start date",
      )
      expectedEndDate = parseInputDate(
        expectedEndDateInput,
        "Expected end date",
      )
    } catch (error) {
      throw new ORPCError("BAD_REQUEST", {
        message: error instanceof Error ? error.message : "Invalid date input",
      })
    }

    validateOfferTiming(
      {
        applicationDeadlineAt,
        expectedStartDate,
        expectedEndDate,
      },
      true,
    )

    const isLanguageRequirementsEnabled = isFeatureEnabled(
      "LANGUAGE_REQUIREMENTS",
    )

    if (isLanguageRequirementsEnabled) {
      if (!languageRequirements || languageRequirements.length === 0) {
        throw new ORPCError("BAD_REQUEST", {
          message: "At least one language requirement is required",
        })
      }

      if (hasDuplicateLanguageCodes(languageRequirements)) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Duplicate language requirements are not allowed",
        })
      }
    }

    try {
      const result = await createOffer({
        companyId: context.companyMembership.companyId,
        ...restInput,
        applicationDeadlineAt,
        expectedStartDate,
        expectedEndDate,
        ...(isLanguageRequirementsEnabled
          ? { languageRequirements: languageRequirements ?? [] }
          : {}),
      })

      // Invalidate company offers cache and public offer search
      revalidateTag(
        CACHE_TAGS.COMPANY_OFFERS(context.companyMembership.companyId),
        { expire: 0 },
      )
      revalidateTag(CACHE_TAGS.OFFER_SEARCH, { expire: 0 })
      revalidateTag(CACHE_TAGS.OFFERS_PUBLIC, { expire: 0 })
      revalidateTag(CACHE_TAGS.COMPANIES_DIRECTORY, { expire: 0 })

      return result
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          INVALID_SKILL_TAG_IDS: "BAD_REQUEST",
        },
        fallbackMessage: "Failed to create offer",
      })
    }
  })

export const updateOfferProcedure = companyAdminProcedureStandard
  .input(
    z.object({
      offerId: z.string().min(1),
      title: z.string().min(3).optional(),
      description: z.string().min(10).optional(),
      internshipType: internshipTypeSchema.optional(),
      workMode: workModeSchema.nullable().optional(),
      wilayaCode: z.coerce.number().int().min(1).max(58).nullable().optional(),
      durationWeeks: z.coerce
        .number()
        .int()
        .min(1)
        .max(52)
        .nullable()
        .optional(),
      maxPositions: z.coerce.number().int().min(1).max(100).optional(),
      applicationDeadlineAt: z.string().min(1).nullable().optional(),
      expectedStartDate: z.string().min(1).nullable().optional(),
      expectedEndDate: z.string().min(1).nullable().optional(),
      skillTagIds: z.array(z.string()).max(20).optional(),
      languageRequirements: z.array(languageRequirementSchema).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    const {
      offerId,
      applicationDeadlineAt: applicationDeadlineAtInput,
      expectedStartDate: expectedStartDateInput,
      expectedEndDate: expectedEndDateInput,
      languageRequirements,
      ...restInput
    } = input

    if (
      (expectedStartDateInput !== undefined ||
        expectedEndDateInput !== undefined) &&
      (expectedStartDateInput === undefined ||
        expectedEndDateInput === undefined)
    ) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Expected start and end dates must both be provided",
      })
    }

    let applicationDeadlineAt: Date | null | undefined
    let expectedStartDate: Date | null | undefined
    let expectedEndDate: Date | null | undefined

    try {
      applicationDeadlineAt = parseOptionalDate(
        applicationDeadlineAtInput,
        "Application deadline",
      )
      expectedStartDate = parseOptionalDate(
        expectedStartDateInput,
        "Expected start date",
      )
      expectedEndDate = parseOptionalDate(
        expectedEndDateInput,
        "Expected end date",
      )
    } catch (error) {
      throw new ORPCError("BAD_REQUEST", {
        message: error instanceof Error ? error.message : "Invalid date input",
      })
    }

    validateOfferTiming(
      {
        applicationDeadlineAt,
        expectedStartDate,
        expectedEndDate,
      },
      true,
    )

    const isLanguageRequirementsEnabled = isFeatureEnabled(
      "LANGUAGE_REQUIREMENTS",
    )

    if (isLanguageRequirementsEnabled && languageRequirements !== undefined) {
      if (languageRequirements.length === 0) {
        throw new ORPCError("BAD_REQUEST", {
          message: "At least one language requirement is required",
        })
      }

      if (hasDuplicateLanguageCodes(languageRequirements)) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Duplicate language requirements are not allowed",
        })
      }
    }

    try {
      const result = await updateOffer(
        offerId,
        context.companyMembership.companyId,
        {
          ...restInput,
          ...(applicationDeadlineAt !== undefined
            ? { applicationDeadlineAt }
            : {}),
          ...(expectedStartDate !== undefined ? { expectedStartDate } : {}),
          ...(expectedEndDate !== undefined ? { expectedEndDate } : {}),
          ...(isLanguageRequirementsEnabled ? { languageRequirements } : {}),
        },
      )

      // Invalidate offer caches
      revalidateTag(CACHE_TAGS.OFFER_DETAIL(offerId), { expire: 0 })
      revalidateTag(
        CACHE_TAGS.COMPANY_OFFERS(context.companyMembership.companyId),
        { expire: 0 },
      )
      revalidateTag(CACHE_TAGS.OFFER_SEARCH, { expire: 0 })
      revalidateTag(CACHE_TAGS.OFFERS_PUBLIC, { expire: 0 })
      revalidateTag(CACHE_TAGS.COMPANIES_DIRECTORY, { expire: 0 })

      return result
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          OFFER_NOT_FOUND: "NOT_FOUND",
          OFFER_CLOSED: "BAD_REQUEST",
          INVALID_SKILL_TAG_IDS: "BAD_REQUEST",
        },
        fallbackMessage: "Failed to update offer",
      })
    }
  })

export const deleteOfferProcedure = companyAdminProcedureStandard
  .input(z.object({ offerId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    try {
      const result = await deleteOffer(
        input.offerId,
        context.companyMembership.companyId,
      )

      // Invalidate offer caches
      revalidateTag(CACHE_TAGS.OFFER_DETAIL(input.offerId), { expire: 0 })
      revalidateTag(
        CACHE_TAGS.COMPANY_OFFERS(context.companyMembership.companyId),
        { expire: 0 },
      )
      revalidateTag(CACHE_TAGS.OFFER_SEARCH, { expire: 0 })
      revalidateTag(CACHE_TAGS.OFFERS_PUBLIC, { expire: 0 })
      revalidateTag(CACHE_TAGS.COMPANIES_DIRECTORY, { expire: 0 })

      return result
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          OFFER_NOT_FOUND: "NOT_FOUND",
          OFFER_PUBLISHED_DELETE_FORBIDDEN: "BAD_REQUEST",
        },
        fallbackMessage: "Failed to delete offer",
      })
    }
  })

export const updateOfferStatusProcedure = companyAdminProcedureStandard
  .input(
    z.object({
      offerId: z.string().min(1),
      action: z.enum(["publish", "close"]),
    }),
  )
  .handler(async ({ input, context }) => {
    // Owner-only gate for publish/close (recruiters can still draft/update)
    if (context.companyMembership.role !== "owner") {
      throw new ORPCError("FORBIDDEN", {
        message: "Only company owners can publish or close offers",
      })
    }
    try {
      const result = await updateOfferStatus(
        input.offerId,
        context.companyMembership.companyId,
        input.action,
      )

      // Invalidate offer caches when status changes
      revalidateTag(CACHE_TAGS.OFFER_DETAIL(input.offerId), { expire: 0 })
      revalidateTag(
        CACHE_TAGS.COMPANY_OFFERS(context.companyMembership.companyId),
        { expire: 0 },
      )
      revalidateTag(CACHE_TAGS.OFFER_SEARCH, { expire: 0 })
      revalidateTag(CACHE_TAGS.OFFERS_PUBLIC, { expire: 0 })
      revalidateTag(CACHE_TAGS.COMPANIES_DIRECTORY, { expire: 0 })

      return result
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          OFFER_NOT_FOUND: "NOT_FOUND",
          OFFER_INVALID_PUBLISH_STATUS: "BAD_REQUEST",
          OFFER_INVALID_CLOSE_STATUS: "BAD_REQUEST",
          OFFER_INVALID_ACTION: "BAD_REQUEST",
          OFFER_EXPECTED_PERIOD_INCOMPLETE: "BAD_REQUEST",
          OFFER_EXPECTED_PERIOD_INVALID: "BAD_REQUEST",
          OFFER_DEADLINE_AFTER_START: "BAD_REQUEST",
          OFFER_DEADLINE_IN_PAST: "BAD_REQUEST",
        },
        fallbackMessage: "Failed to update offer status",
      })
    }
  })

/* ── AI Offer Copilot ── */

const offerFormContextSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  internshipType: z.string().optional(),
  workMode: z.string().nullable().optional(),
  wilayaCode: z.number().int().nullable().optional(),
  durationWeeks: z.number().int().nullable().optional(),
  maxPositions: z.number().int().optional(),
  applicationDeadlineAt: z.string().nullable().optional(),
  expectedStartDate: z.string().nullable().optional(),
  expectedEndDate: z.string().nullable().optional(),
})

const availableSkillTagsSchema = z
  .array(z.object({ id: z.string(), name: z.string() }))
  .max(300)
  .default([])

export const generateOfferDraftProcedure = companyAdminProcedureAssistant
  .input(
    offerFormContextSchema.extend({
      prompt: z.string().max(500).optional(),
      availableSkillTags: availableSkillTagsSchema,
    }),
  )
  .handler(async ({ input }) => {
    try {
      const { generateOfferDraft } = await import(
        "@/server/services/offers/generate-draft"
      )
      return await generateOfferDraft(input)
    } catch (error) {
      throwAIOrpcError(error)
    }
  })

export const improveOfferDescriptionProcedure = companyAdminProcedureAssistant
  .input(offerFormContextSchema)
  .handler(async ({ input }) => {
    try {
      const { improveOfferDescription } = await import(
        "@/server/services/offers/improve-description"
      )
      return await improveOfferDescription(input)
    } catch (error) {
      throwAIOrpcError(error)
    }
  })

export const suggestOfferSkillsProcedure = companyAdminProcedureAssistant
  .input(
    offerFormContextSchema
      .pick({
        title: true,
        description: true,
        internshipType: true,
        workMode: true,
      })
      .extend({ availableSkillTags: availableSkillTagsSchema }),
  )
  .handler(async ({ input }) => {
    try {
      const { suggestOfferSkills } = await import(
        "@/server/services/offers/suggest-skills"
      )
      return await suggestOfferSkills(input)
    } catch (error) {
      throwAIOrpcError(error)
    }
  })

/* ── AI Search Parsing ── */

export const parseSearchQueryProcedure = authedProcedureStrict
  .input(
    z.object({
      query: z.string().min(1).max(500),
      availableSkillTags: z
        .array(z.object({ id: z.string(), name: z.string() }))
        .max(300)
        .default([]),
    }),
  )
  .handler(async ({ input }) => {
    try {
      const { parseSearchQuery } = await import(
        "@/server/services/offers/parse-search"
      )
      return await parseSearchQuery(input)
    } catch (error) {
      throwAIOrpcError(error)
    }
  })
