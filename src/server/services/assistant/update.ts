import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { assistantConversation } from "@/server/db/schema/assistant"

export async function updateAssistantConversationModel(params: {
  conversationId: string
  companyId: string
  model: string
}) {
  const [result] = await db
    .update(assistantConversation)
    .set({ model: params.model })
    .where(
      and(
        eq(assistantConversation.id, params.conversationId),
        eq(assistantConversation.companyId, params.companyId),
      ),
    )

    .returning({ id: assistantConversation.id })

  return { updatedCount: result ? 1 : 0 }
}

export async function updateAssistantConversationTitle(params: {
  conversationId: string
  companyId: string
  title: string | null
}) {
  const [result] = await db
    .update(assistantConversation)
    .set({ title: params.title })
    .where(
      and(
        eq(assistantConversation.id, params.conversationId),
        eq(assistantConversation.companyId, params.companyId),
      ),
    )

    .returning({ id: assistantConversation.id })

  return { updatedCount: result ? 1 : 0 }
}
