export function formatConversationTitle(title: string | null | undefined): string {
  const t = title?.trim()
  return t && t.length > 0 ? t : "Untitled"
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function getStringProp(value: unknown, key: string): string | null {
  if (!isRecord(value)) return null
  const prop = value[key]
  return typeof prop === "string" ? prop : null
}

export function isAuthorizationRequiredOutput(output: unknown): boolean {
  if (!isRecord(output)) return false
  return "authorization_required" in output
}
