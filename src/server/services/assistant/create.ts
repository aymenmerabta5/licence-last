import "server-only"

import { randomUUID } from "node:crypto"

import { db } from "@/server/db"
import { assistantConversation } from "@/server/db/schema/assistant"

export async function createAssistantConversation(data: {
  companyId: string
  createdByUserId: string
  title?: string
  model: string
}) {
  const id = randomUUID()

  const values = {
    id,
    companyId: data.companyId,
    createdByUserId: data.createdByUserId,
    title: data.title ?? null,
    model: data.model,
  }

  await db.insert(assistantConversation).values(values)

  return values
}
