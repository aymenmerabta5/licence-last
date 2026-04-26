import "server-only"

import { ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import {
  authedProcedureGenerous,
  companyAdminProcedureGenerous,
  companyAdminProcedureStandard,
  studentProcedureGenerous,
  studentProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { createServiceORPCError } from "@/server/orpc/utils/service-error"
import {
  isMessageServiceError,
  MessageServiceError,
} from "@/server/services/messages/errors"
import { listMessageStartersByCompany } from "@/server/services/messages/list-starters-by-company"
import { listMessageStartersByStudent } from "@/server/services/messages/list-starters-by-student"
import { listThreadMessages } from "@/server/services/messages/list-thread-messages"
import { listMessageThreadsByCompany } from "@/server/services/messages/list-threads-by-company"
import { listMessageThreadsByStudent } from "@/server/services/messages/list-threads-by-student"
import { markThreadRead } from "@/server/services/messages/mark-thread-read"
import { sendOfferMessageByCompany } from "@/server/services/messages/send-by-company"
import { sendOfferMessageByStudent } from "@/server/services/messages/send-by-student"

async function getSingleCompanyMembership(userId: string) {
  const memberships = await db
    .select({ companyId: companyMember.companyId })
    .from(companyMember)
    .where(eq(companyMember.userId, userId))
    .limit(2)

  if (memberships.length > 1) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Multiple company memberships found for user",
    })
  }

  return memberships[0] ?? null
}

function createMessageORPCError(error: MessageServiceError) {
  createServiceORPCError(error, {
    codeMap: {
      OFFER_NOT_FOUND: "NOT_FOUND",
      OFFER_FORBIDDEN: "FORBIDDEN",
      APPLICATION_NOT_FOUND: "FORBIDDEN",
      THREAD_NOT_FOUND: "NOT_FOUND",
      THREAD_FORBIDDEN: "FORBIDDEN",
      MESSAGE_EMPTY: "BAD_REQUEST",
    },
    fallbackMessage: "Message operation failed",
  })
}

export const listMessageThreadsByCompanyProcedure =
  companyAdminProcedureGenerous
    .input(
      z
        .object({
          offerId: z.string().min(1).optional(),
          limit: z.coerce.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .handler(async ({ input, context }) =>
      listMessageThreadsByCompany(
        context.companyMembership.companyId,
        context.user.id,
        input ?? {},
      ),
    )

export const listMessageThreadsByStudentProcedure = studentProcedureGenerous
  .input(
    z
      .object({
        limit: z.coerce.number().int().min(1).max(100).optional(),
      })
      .optional(),
  )
  .handler(async ({ input, context }) =>
    listMessageThreadsByStudent(context.user.id, input ?? {}),
  )

export const listMessageStartersByCompanyProcedure =
  companyAdminProcedureGenerous
    .input(
      z
        .object({
          limit: z.coerce.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .handler(async ({ input, context }) =>
      listMessageStartersByCompany(
        context.companyMembership.companyId,
        input ?? {},
      ),
    )

export const listMessageStartersByStudentProcedure = studentProcedureGenerous
  .input(
    z
      .object({
        limit: z.coerce.number().int().min(1).max(100).optional(),
      })
      .optional(),
  )
  .handler(async ({ input, context }) =>
    listMessageStartersByStudent(context.user.id, input ?? {}),
  )

export const listThreadMessagesProcedure = authedProcedureGenerous
  .input(z.object({ threadId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    try {
      if (context.user.role === "student") {
        return listThreadMessages(input.threadId, {
          userId: context.user.id,
          role: "student",
        })
      }

      if (context.user.role === "company_admin") {
        const membership = await getSingleCompanyMembership(context.user.id)
        if (!membership) {
          throw new ORPCError("FORBIDDEN", {
            message: "No company membership found",
          })
        }

        return listThreadMessages(input.threadId, {
          userId: context.user.id,
          role: "company_admin",
          companyId: membership.companyId,
        })
      }

      throw new ORPCError("FORBIDDEN", {
        message: "Only students and company admins can access messages",
      })
    } catch (error) {
      if (isMessageServiceError(error)) {
        createMessageORPCError(error)
      }

      throw error
    }
  })

export const sendOfferMessageByCompanyProcedure = companyAdminProcedureStandard
  .input(
    z.object({
      offerId: z.string().min(1),
      studentUserId: z.string().min(1),
      body: z.string().min(1).max(5000),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      return await sendOfferMessageByCompany(
        input,
        context.companyMembership.companyId,
        context.user.id,
      )
    } catch (error) {
      if (isMessageServiceError(error)) {
        createMessageORPCError(error)
      }

      createServiceORPCError(error, {
        codeMap: {},
        fallbackMessage: "Failed to send message",
      })
    }
  })

export const sendOfferMessageByStudentProcedure = studentProcedureStandard
  .input(
    z.object({
      offerId: z.string().min(1),
      body: z.string().min(1).max(5000),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      return await sendOfferMessageByStudent(input, context.user.id)
    } catch (error) {
      if (isMessageServiceError(error)) {
        createMessageORPCError(error)
      }

      createServiceORPCError(error, {
        codeMap: {},
        fallbackMessage: "Failed to send message",
      })
    }
  })

export const markThreadReadProcedure = authedProcedureGenerous
  .input(z.object({ threadId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    try {
      if (context.user.role === "student") {
        return markThreadRead(input.threadId, {
          userId: context.user.id,
          role: "student",
        })
      }

      if (context.user.role === "company_admin") {
        const membership = await getSingleCompanyMembership(context.user.id)
        if (!membership) {
          throw new ORPCError("FORBIDDEN", {
            message: "No company membership found",
          })
        }

        return markThreadRead(input.threadId, {
          userId: context.user.id,
          role: "company_admin",
          companyId: membership.companyId,
        })
      }

      throw new ORPCError("FORBIDDEN", {
        message: "Only students and company admins can access messages",
      })
    } catch (error) {
      if (isMessageServiceError(error)) {
        createMessageORPCError(error)
      }

      throw error
    }
  })
