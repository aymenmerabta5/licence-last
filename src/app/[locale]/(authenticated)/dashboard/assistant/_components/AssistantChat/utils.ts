export function formatConversationTitle(
  title: string | null | undefined,
): string {
  const t = title?.trim()
  return t && t.length > 0 ? t : "Untitled"
}

type RelativeUpdatedAtKey =
  | "relativeNow"
  | "relativeMinutesShort"
  | "relativeHoursShort"
  | "relativeDaysShort"

type RelativeUpdatedAtTranslator = (
  key: RelativeUpdatedAtKey,
  params?: { count: number },
) => string

export function formatRelativeUpdatedAt(
  value: string | Date,
  t: RelativeUpdatedAtTranslator,
): string {
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ""

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return t("relativeNow")
  if (diffMins < 60) return t("relativeMinutesShort", { count: diffMins })
  if (diffHours < 24) return t("relativeHoursShort", { count: diffHours })
  if (diffDays < 7) return t("relativeDaysShort", { count: diffDays })

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
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
