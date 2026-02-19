import "server-only"

import { z } from "zod"
import {
  getAllowedPoeModelIds,
  getDefaultPoeModelId,
  isAllowedPoeModelId,
} from "@/server/ai/model"
import {
  companyAdminProcedureAssistant,
  companyAdminProcedureGenerous,
  companyAdminProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { createAssistantConversation } from "@/server/services/assistant/create"
import { deleteAssistantConversation } from "@/server/services/assistant/delete"
import { getAssistantConversationByIdForCompany } from "@/server/services/assistant/get"
import { listAssistantConversationsByCompanyId } from "@/server/services/assistant/list"
import {
  appendAssistantMessage,
  listAssistantMessages,
} from "@/server/services/assistant/messages"
import {
  updateAssistantConversationModel,
  updateAssistantConversationTitle,
} from "@/server/services/assistant/update"

const ASSISTANT_MODEL_SCHEMA = z
  .string()
  .min(1)
  .refine((v) => isAllowedPoeModelId(v), { message: "Model not allowed" })

export const listAssistantModelsProcedure = companyAdminProcedureGenerous
  .input(z.undefined().optional())
  .handler(async () => {
    return {
      models: getAllowedPoeModelIds().map((id) => ({ id, label: id })),
      defaultModelId: getDefaultPoeModelId(),
    }
  })

export const listAssistantConversationsProcedure = companyAdminProcedureGenerous
  .input(
    z.object({ limit: z.number().int().min(1).max(200).optional() }).optional(),
  )
  .handler(async ({ input, context }) => {
    return listAssistantConversationsByCompanyId({
      companyId: context.companyMembership.companyId,
      limit: input?.limit,
    })
  })

export const createAssistantConversationProcedure =
  companyAdminProcedureStandard
    .input(
      z.object({
        title: z.string().min(1).max(120).optional(),
        model: ASSISTANT_MODEL_SCHEMA,
      }),
    )
    .handler(async ({ input, context }) => {
      return createAssistantConversation({
        companyId: context.companyMembership.companyId,
        createdByUserId: context.user.id,
        title: input.title,
        model: input.model,
      })
    })

export const getAssistantConversationProcedure = companyAdminProcedureGenerous
  .input(z.object({ conversationId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    const conversation = await getAssistantConversationByIdForCompany({
      conversationId: input.conversationId,
      companyId: context.companyMembership.companyId,
    })

    return { conversation }
  })

export const listAssistantMessagesProcedure = companyAdminProcedureGenerous
  .input(z.object({ conversationId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    return listAssistantMessages({
      conversationId: input.conversationId,
      companyId: context.companyMembership.companyId,
    })
  })

export const updateAssistantConversationModelProcedure =
  companyAdminProcedureStandard
    .input(
      z.object({
        conversationId: z.string().min(1),
        model: ASSISTANT_MODEL_SCHEMA,
      }),
    )
    .handler(async ({ input, context }) => {
      return updateAssistantConversationModel({
        conversationId: input.conversationId,
        companyId: context.companyMembership.companyId,
        model: input.model,
      })
    })

export const updateAssistantConversationTitleProcedure =
  companyAdminProcedureStandard
    .input(
      z.object({
        conversationId: z.string().min(1),
        title: z.string().min(1).max(120).nullable(),
      }),
    )
    .handler(async ({ input, context }) => {
      return updateAssistantConversationTitle({
        conversationId: input.conversationId,
        companyId: context.companyMembership.companyId,
        title: input.title,
      })
    })

// AI message operation - uses strict rate limiting (20 req/min)
export const appendAssistantMessageProcedure = companyAdminProcedureAssistant
  .input(
    z.object({
      conversationId: z.string().min(1),
      role: z.literal("user"),
      parts: z.array(z.unknown()).default([]),
    }),
  )
  .handler(async ({ input, context }) => {
    return appendAssistantMessage({
      conversationId: input.conversationId,
      companyId: context.companyMembership.companyId,
      role: input.role,
      parts: input.parts,
    })
  })

export const deleteAssistantConversationProcedure =
  companyAdminProcedureStandard
    .input(
      z.object({
        conversationId: z.string().min(1),
      }),
    )
    .handler(async ({ input, context }) => {
      return deleteAssistantConversation({
        conversationId: input.conversationId,
        companyId: context.companyMembership.companyId,
      })
    })
