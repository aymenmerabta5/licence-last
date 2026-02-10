import "server-only"

import { z } from "zod"

import { companyAdminProcedure } from "@/server/orpc/middleware"
import {
  getAllowedPoeModelIds,
  getDefaultPoeModelId,
  isAllowedPoeModelId,
} from "@/server/services/ai/model"
import {
  createAssistantConversation,
} from "@/server/services/assistant/create"
import { getAssistantConversationByIdForCompany } from "@/server/services/assistant/get"
import { listAssistantConversationsByCompanyId } from "@/server/services/assistant/list"
import { appendAssistantMessage, listAssistantMessages } from "@/server/services/assistant/messages"
import {
  updateAssistantConversationModel,
  updateAssistantConversationTitle,
} from "@/server/services/assistant/update"

const ASSISTANT_MODEL_SCHEMA = z
  .string()
  .min(1)
  .refine((v) => isAllowedPoeModelId(v), { message: "Model not allowed" })

export const listAssistantModelsProcedure = companyAdminProcedure
  .input(z.undefined().optional())
  .handler(async () => {
    return {
      models: getAllowedPoeModelIds().map((id) => ({ id, label: id })),
      defaultModelId: getDefaultPoeModelId(),
    }
  })

export const listAssistantConversationsProcedure = companyAdminProcedure
  .input(z.object({ limit: z.number().int().min(1).max(200).optional() }).optional())
  .handler(async ({ input, context }) => {
    return listAssistantConversationsByCompanyId({
      companyId: context.companyMembership.companyId,
      limit: input?.limit,
    })
  })

export const createAssistantConversationProcedure = companyAdminProcedure
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

export const getAssistantConversationProcedure = companyAdminProcedure
  .input(z.object({ conversationId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    const conversation = await getAssistantConversationByIdForCompany({
      conversationId: input.conversationId,
      companyId: context.companyMembership.companyId,
    })

    return { conversation }
  })

export const listAssistantMessagesProcedure = companyAdminProcedure
  .input(z.object({ conversationId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    return listAssistantMessages({
      conversationId: input.conversationId,
      companyId: context.companyMembership.companyId,
    })
  })

export const updateAssistantConversationModelProcedure = companyAdminProcedure
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

export const updateAssistantConversationTitleProcedure = companyAdminProcedure
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

// Optional utility: persist a message from the client without hitting the model.
// This is useful if we ever add client-side notes or manual tool call annotations.
export const appendAssistantMessageProcedure = companyAdminProcedure
  .input(
    z.object({
      conversationId: z.string().min(1),
      role: z.enum(["system", "user", "assistant"]),
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
