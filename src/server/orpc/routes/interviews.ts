import "server-only"

import { ORPCError } from "@orpc/server"
import { z } from "zod"

import { isFeatureEnabled } from "@/lib/feature-flags"
import {
  companyAdminProcedureGenerous,
  companyAdminProcedureStandard,
  studentProcedureGenerous,
  studentProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { parseInputDate } from "@/server/orpc/utils/date"
import { createServiceORPCError } from "@/server/orpc/utils/service-error"
import { confirmInterviewSlot } from "@/server/services/interviews/confirm"
import {
  isInterviewServiceError,
  InterviewServiceError,
} from "@/server/services/interviews/errors"
import { listInterviewsForCompany } from "@/server/services/interviews/list-for-company"
import { listInterviewsForStudent } from "@/server/services/interviews/list-for-student"
import { proposeInterviewSlots } from "@/server/services/interviews/propose"

function assertInterviewsEnabled() {
  if (!isFeatureEnabled("INTERVIEWS")) {
    throw new ORPCError("FORBIDDEN", {
      message: "Interviews feature is disabled",
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
      .enum(["pending_confirmation", "confirmed", "cancelled"])
      .optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .optional()

export const listInterviewsForCompanyProcedure = companyAdminProcedureGenerous
  .input(listInterviewsInputSchema)
  .handler(async ({ input, context }) => {
    assertInterviewsEnabled()
    return listInterviewsForCompany(context.companyMembership.companyId, input ?? {})
  })

export const listInterviewsForStudentProcedure = studentProcedureGenerous
  .input(
    z
      .object({
        status: z
          .enum(["pending_confirmation", "confirmed", "cancelled"])
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
            startsAt: z.string().min(1),
            endsAt: z.string().min(1),
            location: z.string().max(200).optional(),
            meetingUrl: z.string().url().optional().or(z.literal("")),
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
            startsAt: parseInputDate(slot.startsAt, `Interview slot ${index + 1} start`),
            endsAt: parseInputDate(slot.endsAt, `Interview slot ${index + 1} end`),
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
