export type ToolOutputMessage = {
  role: string
  parts: unknown[]
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null
  return value as Record<string, unknown>
}

export function getString(value: unknown): string | null {
  return typeof value === "string" ? value : null
}

export function getNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

export function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map(getString).filter((v): v is string => Boolean(v))
}

export function getStringProp(obj: Record<string, unknown> | null, key: string): string | null {
  if (!obj) return null
  return getString(obj[key])
}

export function findLatestToolOutput(
  messages: ToolOutputMessage[],
  toolName: string,
): unknown | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i]
    if (message?.role !== "assistant") continue

    for (let j = message.parts.length - 1; j >= 0; j -= 1) {
      const partRecord = asRecord(message.parts[j])
      if (!partRecord) continue
      if (partRecord.type !== "dynamic-tool") continue
      if (partRecord.toolName !== toolName) continue
      if (partRecord.state !== "output-available") continue

      return ("output" in partRecord ? partRecord.output : null) ?? null
    }
  }

  return null
}
