import "server-only"

import type { UIMessage } from "ai"
import { eq } from "drizzle-orm"
import type { PersistenceResult } from "@/server/ai/types"
import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import { getAssistantConversationByIdForCompany } from "@/server/services/assistant/get"
import {
  appendAssistantMessage,
  getLatestAssistantMessage,
} from "@/server/services/assistant/messages"
import { extractTextFromParts } from "@/server/services/assistant/utils"

interface ResolvePersistenceParams {
  role: string
  intent: string | null
  conversationId: string | null
  userId: string
}

export async function resolvePersistence({
  role,
  intent,
  conversationId,
  userId,
}: ResolvePersistenceParams): Promise<PersistenceResult | null> {
  // Persist only for the free-form Company Admin assistant chat
  const shouldPersist =
    role === "company_admin" &&
    intent === null &&
    conversationId !== null &&
    conversationId.length > 0

  if (!shouldPersist) {
    return null
  }

  const memberships = await db
    .select({ companyId: companyMember.companyId })
    .from(companyMember)
    .where(eq(companyMember.userId, userId))
    .limit(2)

  if (memberships.length > 1) {
    return { ok: false, status: 403, companyId: null, modelId: null }
  }

  const membership = memberships[0]

  if (!membership) {
    return { ok: false, status: 403, companyId: null, modelId: null }
  }

  const conversation = await getAssistantConversationByIdForCompany({
    conversationId,
    companyId: membership.companyId,
  })

  if (!conversation) {
    return { ok: false, status: 404, companyId: null, modelId: null }
  }

  return {
    ok: true,
    status: 200,
    companyId: membership.companyId,
    modelId: conversation.model,
  }
}

interface PersistUserMessageParams {
  conversationId: string
  companyId: string
  message: UIMessage
}

export async function persistUserMessage({
  conversationId,
  companyId,
  message,
}: PersistUserMessageParams): Promise<void> {
  if (message.role !== "user") return

  const lastStored = await getLatestAssistantMessage({
    conversationId,
    companyId,
  })

  const latestUserText = extractTextFromParts(message.parts as unknown[])
  const shouldAppendUser =
    lastStored?.role !== "user" || (lastStored?.text ?? "") !== latestUserText

  if (shouldAppendUser) {
    await appendAssistantMessage({
      conversationId,
      companyId,
      role: "user",
      parts: message.parts,
    })
  }
}

interface PersistAssistantResponseParams {
  conversationId: string
  companyId: string
  parts: unknown[]
}

export async function persistAssistantResponse({
  conversationId,
  companyId,
  parts,
}: PersistAssistantResponseParams): Promise<void> {
  await appendAssistantMessage({
    conversationId,
    companyId,
    role: "assistant",
    parts,
  })
}
