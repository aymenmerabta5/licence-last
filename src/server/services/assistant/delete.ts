import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { assistantConversation, assistantMessage } from "@/server/db/schema/assistant"

export async function deleteAssistantConversation({
  conversationId,
  companyId,
}: {
  conversationId: string
  companyId: string
}): Promise<{ deletedCount: number }> {
  // First verify the conversation belongs to the company
  const [conversation] = await db
    .select({ id: assistantConversation.id })
    .from(assistantConversation)
    .where(
      and(
        eq(assistantConversation.id, conversationId),
        eq(assistantConversation.companyId, companyId),
      ),
    )
    .limit(1)

  if (!conversation) {
    return { deletedCount: 0 }
  }

  // Delete messages first (cascade should handle this, but explicit is safer)
  await db
    .delete(assistantMessage)
    .where(eq(assistantMessage.conversationId, conversationId))

  // Delete the conversation
  await db
    .delete(assistantConversation)
    .where(eq(assistantConversation.id, conversationId))

  return { deletedCount: 1 }
}
