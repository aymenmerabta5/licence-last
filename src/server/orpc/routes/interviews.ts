import "server-only"

import { z } from "zod"

import { isFeatureEnabled } from "@/lib/feature-flags"
import {
  companyAdminProcedureGenerous,
  companyAdminProcedureStandard,
  studentProcedureGenerous,
  studentProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { parseInputDate } from "@/server/orpc/utils/date"
import {
  createServiceORPCError,
  throwCodedORPCError,
} from "@/server/orpc/utils/service-error"
import { cancelInterview } from "@/server/services/interviews/cancel"
import { completeInterview } from "@/server/services/interviews/complete"
import { confirmInterviewSlot } from "@/server/services/interviews/confirm"
import {
  type InterviewServiceError,
  isInterviewServiceError,
} from "@/server/services/interviews/errors"
import { getInterviewById } from "@/server/services/interviews/get-by-id"
import { listInterviewsForCompany } from "@/server/services/interviews/list-for-company"
import { listInterviewsForStudent } from "@/server/services/interviews/list-for-student"
import { proposeInterviewSlots } from "@/server/services/interviews/propose"
import { requestInterviewReschedule } from "@/server/services/interviews/request-reschedule"
import { rescheduleInterviewSlots } from "@/server/services/interviews/reschedule"

const INTERVIEW_DATE_TIME_SCHEMA = z.string().datetime({ offset: true })
const INTERVIEW_MEETING_URL_SCHEMA = z
  .union([z.literal(""), z.string().url()])
  .optional()
  .refine((value) => {
    if (!value) {
      return true
    }

    try {
      const protocol = new URL(value).protocol
      return protocol === "http:" || protocol === "https:"
    } catch {
      return false
    }
  }, "Meeting URL must use http:// or https://")

function assertInterviewsEnabled() {
  if (!isFeatureEnabled("INTERVIEWS")) {
    throwCodedORPCError("FORBIDDEN", "INTERVIEWS_FEATURE_DISABLED", {
      message: "Interviews feature is disabled",
    })
  }
}

function parseInterviewSlotDate(value: string, fieldLabel: string) {
  try {
    return parseInputDate(value, fieldLabel)
  } catch (error) {
    throwCodedORPCError("BAD_REQUEST", "INTERVIEW_SLOT_DATE_INVALID", {
      message:
        error instanceof Error ? error.message : `${fieldLabel} is invalid`,
      meta: { fieldLabel },
      cause: error,
    })
  }
}

function createInterviewORPCError(error: InterviewServiceError) {
  createServiceORPCError(error, {
    codeMap: {
      APPLICATION_NOT_FOUND: "NOT_FOUND",
      APPLICATION_FORBIDDEN: "FORBIDDEN",
      INTERVIEW_ALREADY_EXISTS: "CONFLICT",
      INTERVIEW_NOT_FOUND: "NOT_FOUND",
      INTERVIEW_FORBIDDEN: "FORBIDDEN",
      INTERVIEW_ALREADY_CONFIRMED: "BAD_REQUEST",
      INTERVIEW_ALREADY_COMPLETED: "BAD_REQUEST",
      INTERVIEW_INVALID_STATUS: "BAD_REQUEST",
      INTERVIEW_SLOT_NOT_FOUND: "NOT_FOUND",
      INTERVIEW_SLOT_INVALID: "BAD_REQUEST",
      INTERVIEW_INVALID_APPLICATION_STATE: "BAD_REQUEST",
    },
    fallbackMessage: "Interview operation failed",
  })
}

const listInterviewsInputSchema = z
  .object({
    offerId: z.string().min(1).optional(),
    status: z
      .enum([
        "pending_confirmation",
        "confirmed",
        "cancelled",
        "completed",
        "reschedule_requested",
      ])
      .optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .optional()

export const listInterviewsForCompanyProcedure = companyAdminProcedureGenerous
  .input(listInterviewsInputSchema)
  .handler(async ({ input, context }) => {
    assertInterviewsEnabled()
    return listInterviewsForCompany(
      context.companyMembership.companyId,
      input ?? {},
    )
  })

export const listInterviewsForStudentProcedure = studentProcedureGenerous
  .input(
    z
      .object({
        status: z
          .enum([
            "pending_confirmation",
            "confirmed",
            "cancelled",
            "completed",
            "reschedule_requested",
          ])
          .optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
      })
      .optional(),
  )
  .handler(async ({ input, context }) => {
    assertInterviewsEnabled()
    return listInterviewsForStudent(context.user.id, input ?? {})
  })

export const proposeInterviewSlotsProcedure = companyAdminProcedureStandard
  .input(
    z.object({
      applicationId: z.string().min(1),
      note: z.string().max(1000).optional(),
      slots: z
        .array(
          z.object({
            startsAt: INTERVIEW_DATE_TIME_SCHEMA,
            endsAt: INTERVIEW_DATE_TIME_SCHEMA,
            location: z.string().max(200).optional(),
            meetingUrl: INTERVIEW_MEETING_URL_SCHEMA,
          }),
        )
        .min(1)
        .max(20),
    }),
  )
  .handler(async ({ input, context }) => {
    assertInterviewsEnabled()

    try {
      const result = await proposeInterviewSlots(
        {
          applicationId: input.applicationId,
          note: input.note,
          slots: input.slots.map((slot, index) => ({
            startsAt: parseInterviewSlotDate(
              slot.startsAt,
              `Interview slot ${index + 1} start`,
            ),
            endsAt: parseInterviewSlotDate(
              slot.endsAt,
              `Interview slot ${index + 1} end`,
            ),
            location: slot.location || null,
            meetingUrl: slot.meetingUrl || null,
          })),
        },
        context.companyMembership.companyId,
        context.user.id,
      )

      return result
    } catch (error) {
      if (isInterviewServiceError(error)) {
        createInterviewORPCError(error)
      }

      createServiceORPCError(error, {
        codeMap: {},
        fallbackMessage: "Failed to propose interview slots",
      })
    }
  })

export const confirmInterviewSlotProcedure = studentProcedureStandard
  .input(
    z.object({
      interviewId: z.string().min(1),
      slotId: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    assertInterviewsEnabled()

    try {
      return await confirmInterviewSlot(
        input.interviewId,
        input.slotId,
        context.user.id,
      )
    } catch (error) {
      if (isInterviewServiceError(error)) {
        createInterviewORPCError(error)
      }

      createServiceORPCError(error, {
        codeMap: {},
        fallbackMessage: "Failed to confirm interview slot",
      })
    }
  })

export const getInterviewByIdProcedure = studentProcedureGenerous
  .input(z.object({ interviewId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    assertInterviewsEnabled()
    try {
      return await getInterviewById(input.interviewId, context.user.id)
    } catch (error) {
      if (isInterviewServiceError(error)) {
        createInterviewORPCError(error)
      }
      createServiceORPCError(error, {
        codeMap: {},
        fallbackMessage: "Failed to load interview",
      })
    }
  })

export const completeInterviewProcedure = companyAdminProcedureStandard
  .input(z.object({ interviewId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    assertInterviewsEnabled()

    try {
      return await completeInterview(
        input.interviewId,
        context.companyMembership.companyId,
        context.user.id,
      )
    } catch (error) {
      if (isInterviewServiceError(error)) {
        createInterviewORPCError(error)
      }

      createServiceORPCError(error, {
        codeMap: {},
        fallbackMessage: "Failed to complete interview",
      })
    }
  })

export const cancelInterviewProcedure = companyAdminProcedureStandard
  .input(
    z.object({
      interviewId: z.string().min(1),
      reason: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    assertInterviewsEnabled()

    try {
      return await cancelInterview({
        interviewId: input.interviewId,
        companyId: context.companyMembership.companyId,
        actionByUserId: context.user.id,
        actorRole: context.user.role,
        reason: input.reason,
      })
    } catch (error) {
      if (isInterviewServiceError(error)) {
        createInterviewORPCError(error)
      }

      createServiceORPCError(error, {
        codeMap: {},
        fallbackMessage: "Failed to cancel interview",
      })
    }
  })

export const requestInterviewRescheduleProcedure = studentProcedureStandard
  .input(
    z.object({
      interviewId: z.string().min(1),
      reason: z.string().max(500).optional(),
      proposedSlots: z
        .array(
          z.object({
            startsAt: INTERVIEW_DATE_TIME_SCHEMA,
            endsAt: INTERVIEW_DATE_TIME_SCHEMA,
          }),
        )
        .min(1)
        .max(3),
    }),
  )
  .handler(async ({ input, context }) => {
    assertInterviewsEnabled()
    try {
      return await requestInterviewReschedule(
        {
          interviewId: input.interviewId,
          reason: input.reason,
          proposedSlots: input.proposedSlots.map((slot) => ({
            startsAt: parseInterviewSlotDate(slot.startsAt, "Proposed slot start"),
            endsAt: parseInterviewSlotDate(slot.endsAt, "Proposed slot end"),
          })),
        },
        context.user.id,
      )
    } catch (error) {
      if (isInterviewServiceError(error)) {
        createInterviewORPCError(error)
      }
      createServiceORPCError(error, {
        codeMap: {},
        fallbackMessage: "Failed to request reschedule",
      })
    }
  })

export const rescheduleInterviewSlotsProcedure = companyAdminProcedureStandard
  .input(
    z.object({
      interviewId: z.string().min(1),
      note: z.string().max(1000).optional(),
      slots: z
        .array(
          z.object({
            startsAt: INTERVIEW_DATE_TIME_SCHEMA,
            endsAt: INTERVIEW_DATE_TIME_SCHEMA,
            location: z.string().max(200).optional(),
            meetingUrl: INTERVIEW_MEETING_URL_SCHEMA,
          }),
        )
        .min(1)
        .max(20),
    }),
  )
  .handler(async ({ input, context }) => {
    assertInterviewsEnabled()
    try {
      return await rescheduleInterviewSlots(
        {
          interviewId: input.interviewId,
          note: input.note,
          slots: input.slots.map((slot, index) => ({
            startsAt: parseInterviewSlotDate(slot.startsAt, `Slot ${index + 1} start`),
            endsAt: parseInterviewSlotDate(slot.endsAt, `Slot ${index + 1} end`),
            location: slot.location || null,
            meetingUrl: slot.meetingUrl || null,
          })),
        },
        context.companyMembership.companyId,
        context.user.id,
      )
    } catch (error) {
      if (isInterviewServiceError(error)) {
        createInterviewORPCError(error)
      }
      createServiceORPCError(error, {
        codeMap: {},
        fallbackMessage: "Failed to reschedule interview",
      })
    }
  })
