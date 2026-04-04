type MessageValue = string | MessageTree | MessageValue[]

interface MessageTree {
  [key: string]: MessageValue
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function isBrokenTranslationString(value: unknown) {
  return (
    typeof value === "string" &&
    (value.includes("???") || /^[?\s]+$/.test(value))
  )
}

export function mergeMessagesWithFallback<T extends MessageValue>(
  primary: T,
  fallback: T,
): T {
  if (Array.isArray(primary) && Array.isArray(fallback)) {
    return primary.map((item, index) =>
      mergeMessagesWithFallback(item, fallback[index] as MessageValue),
    ) as T
  }

  if (isPlainObject(primary) && isPlainObject(fallback)) {
    const merged: Record<string, unknown> = {}
    const keys = new Set([...Object.keys(fallback), ...Object.keys(primary)])

    for (const key of keys) {
      const primaryValue = primary[key]
      const fallbackValue = fallback[key]

      if (primaryValue === undefined) {
        merged[key] = fallbackValue
        continue
      }

      if (fallbackValue === undefined) {
        merged[key] = primaryValue
        continue
      }

      merged[key] = mergeMessagesWithFallback(
        primaryValue as MessageValue,
        fallbackValue as MessageValue,
      )
    }

    return merged as T
  }

  if (isBrokenTranslationString(primary)) {
    return fallback
  }

  return primary
}
