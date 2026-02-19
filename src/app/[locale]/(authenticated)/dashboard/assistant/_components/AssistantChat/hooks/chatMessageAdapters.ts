import type { UIMessage } from "ai"

function isMessageRole(value: unknown): value is "system" | "user" | "assistant" {
  return value === "system" || value === "user" || value === "assistant"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

type UIMessagePart = UIMessage["parts"][number]

function isUIMessagePart(value: unknown): value is UIMessagePart {
  return isRecord(value) && typeof value.type === "string"
}

function coerceParts(value: unknown): UIMessage["parts"] {
  if (!Array.isArray(value)) return []
  return value.filter(isUIMessagePart)
}

export function toChatMessages(
  rows: Array<{ id: string; role: unknown; parts: unknown }>,
): UIMessage[] {
  return rows
    .filter(
      (row): row is { id: string; role: "system" | "user" | "assistant"; parts: unknown } =>
        isMessageRole(row.role),
    )
    .map((row) => ({
      id: row.id,
      role: row.role,
      parts: coerceParts(row.parts),
    }))
}

export function toMessageCreatedAtById(
  rows: Array<{ id: string; createdAt: string | Date | undefined }>,
) {
  const map: Record<string, string | Date | undefined> = {}

  for (const row of rows) {
    map[row.id] = row.createdAt
  }

  return map
}
