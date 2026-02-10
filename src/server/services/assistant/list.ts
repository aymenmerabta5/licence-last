import "server-only"

import { desc, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { assistantConversation } from "@/server/db/schema/assistant"

export async function listAssistantConversationsByCompanyId(params: {
  companyId: string
  limit?: number
}) {
  const limit = params.limit ?? 50

  const conversations = await db
    .select({
      id: assistantConversation.id,
      title: assistantConversation.title,
      model: assistantConversation.model,
      createdAt: assistantConversation.createdAt,
      updatedAt: assistantConversation.updatedAt,
      createdByUserId: assistantConversation.createdByUserId,
    })
    .from(assistantConversation)
    .where(eq(assistantConversation.companyId, params.companyId))
    .orderBy(desc(assistantConversation.updatedAt))
    .limit(limit)

  return { conversations }
}
