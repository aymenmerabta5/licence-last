import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { assistantConversation } from "@/server/db/schema/assistant"

export async function getAssistantConversationByIdForCompany(params: {
  conversationId: string
  companyId: string
}) {
  const [conversation] = await db
    .select({
      id: assistantConversation.id,
      title: assistantConversation.title,
      model: assistantConversation.model,
      createdAt: assistantConversation.createdAt,
      updatedAt: assistantConversation.updatedAt,
      createdByUserId: assistantConversation.createdByUserId,
    })
    .from(assistantConversation)
    .where(
      and(
        eq(assistantConversation.id, params.conversationId),
        eq(assistantConversation.companyId, params.companyId),
      ),
    )
    .limit(1)

  return conversation ?? null
}
