import "server-only"

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function shouldRedactKey(key: string): boolean {
  const k = key.toLowerCase()
  return (
    k.includes("authorization") ||
    k.includes("access_token") ||
    k.includes("refresh_token") ||
    k.includes("token") ||
    k.includes("secret") ||
    k.includes("password") ||
    k.includes("api_key") ||
    k.includes("apikey")
  )
}

export function redactSecrets(
  value: unknown,
  options?: { maxDepth?: number },
): unknown {
  const maxDepth = options?.maxDepth ?? 6

  const visit = (v: unknown, depth: number): unknown => {
    if (depth > maxDepth) return "[TRUNCATED]"
    if (v == null) return v
    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean"
    )
      return v

    if (Array.isArray(v)) {
      return v.map((item) => visit(item, depth + 1))
    }

    if (isPlainObject(v)) {
      const out: Record<string, unknown> = {}
      for (const [key, child] of Object.entries(v)) {
        if (shouldRedactKey(key)) {
          out[key] = "[REDACTED]"
          continue
        }
        out[key] = visit(child, depth + 1)
      }
      return out
    }

    // Dates, Errors, etc.
    try {
      return JSON.parse(JSON.stringify(v)) as unknown
    } catch {
      return String(v)
    }
  }

  return visit(value, 0)
}

export function stripProviderMetadata(
  value: unknown,
  options?: { maxDepth?: number },
): unknown {
  const maxDepth = options?.maxDepth ?? 6

  const visit = (v: unknown, depth: number): unknown => {
    if (depth > maxDepth) return "[TRUNCATED]"
    if (v == null) return v
    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean"
    )
      return v

    if (Array.isArray(v)) {
      return v.map((item) => visit(item, depth + 1))
    }

    if (isPlainObject(v)) {
      const out: Record<string, unknown> = {}
      for (const [key, child] of Object.entries(v)) {
        if (key === "providerMetadata" || key === "callProviderMetadata")
          continue
        out[key] = visit(child, depth + 1)
      }
      return out
    }

    try {
      return JSON.parse(JSON.stringify(v)) as unknown
    } catch {
      return String(v)
    }
  }

  return visit(value, 0)
}

export function extractTextFromParts(parts: unknown[]): string {
  const texts: string[] = []

  for (const part of parts) {
    if (!isPlainObject(part)) continue
    if (part.type === "text" && typeof part.text === "string") {
      texts.push(part.text)
    }
  }

  return texts.join("")
}
