import "server-only"

import { randomUUID } from "node:crypto"

import { and, asc, desc, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { assistantConversation, assistantMessage } from "@/server/db/schema/assistant"

import { extractTextFromParts, redactSecrets, stripProviderMetadata } from "@/server/services/assistant/utils"

type AssistantMessageRole = "system" | "user" | "assistant"

export async function listAssistantMessages(params: {
  conversationId: string
  companyId: string
}) {
  // Join through conversation for company scoping.
  const rows = await db
    .select({
      id: assistantMessage.id,
      role: assistantMessage.role,
      text: assistantMessage.text,
      parts: assistantMessage.parts,
      createdAt: assistantMessage.createdAt,
    })
    .from(assistantMessage)
    .innerJoin(
      assistantConversation,
      eq(assistantMessage.conversationId, assistantConversation.id),
    )
    .where(
      and(
        eq(assistantConversation.id, params.conversationId),
        eq(assistantConversation.companyId, params.companyId),
      ),
    )
    .orderBy(asc(assistantMessage.createdAt), asc(assistantMessage.id))

  return { messages: rows }
}

export async function getLatestAssistantMessage(params: {
  conversationId: string
  companyId: string
}) {
  const rows = await db
    .select({
      id: assistantMessage.id,
      role: assistantMessage.role,
      text: assistantMessage.text,
      createdAt: assistantMessage.createdAt,
    })
    .from(assistantMessage)
    .innerJoin(
      assistantConversation,
      eq(assistantMessage.conversationId, assistantConversation.id),
    )
    .where(
      and(
        eq(assistantConversation.id, params.conversationId),
        eq(assistantConversation.companyId, params.companyId),
      ),
    )
    .orderBy(desc(assistantMessage.createdAt), desc(assistantMessage.id))
    .limit(1)

  return rows[0] ?? null
}

export async function appendAssistantMessage(params: {
  conversationId: string
  companyId: string
  role: AssistantMessageRole
  parts: unknown[]
}) {
  const id = randomUUID()
  const partsNoProvider = stripProviderMetadata(params.parts) as unknown
  const partsRedacted = redactSecrets(partsNoProvider) as unknown

  const safeParts = Array.isArray(partsRedacted) ? partsRedacted : []
  const text = extractTextFromParts(safeParts)

  // Company scoping enforced by verifying the conversation belongs to the company.
  const conversation = await db
    .select({ id: assistantConversation.id })
    .from(assistantConversation)
    .where(
      and(
        eq(assistantConversation.id, params.conversationId),
        eq(assistantConversation.companyId, params.companyId),
      ),
    )
    .limit(1)

  if (conversation.length === 0) {
    return { ok: false as const, messageId: null }
  }

  await db.transaction(async (tx) => {
    await tx.insert(assistantMessage).values({
      id,
      conversationId: params.conversationId,
      role: params.role,
      text: text.length > 0 ? text : null,
      parts: safeParts,
    })

    await tx
      .update(assistantConversation)
      .set({ updatedAt: new Date() })
      .where(eq(assistantConversation.id, params.conversationId))
  })

  return { ok: true as const, messageId: id }
}
