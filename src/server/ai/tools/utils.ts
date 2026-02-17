import "server-only"

/**
 * Strip sensitive fields from an object before returning to the LLM.
 * Works on arrays and nested objects recursively.
 */
const DEFAULT_STRIP_KEYS = new Set([
  "id",
  "companyId",
  "offerId",
  "userId",
  "studentProfileId",
  "universityId",
  "departmentId",
  "email",
  "phone",
  "address",
  "coverLetter",
  "bio",
  "image",
  "logoUrl",
  "companyNote",
])

export function redactForAssistant<T>(
  data: T,
  extraStripKeys: string[] = [],
): T {
  const stripKeys = extraStripKeys.length
    ? new Set([...DEFAULT_STRIP_KEYS, ...extraStripKeys])
    : DEFAULT_STRIP_KEYS

  return redactRecursive(data, stripKeys)
}

function redactRecursive<T>(data: T, stripKeys: Set<string>): T {
  if (data === null || data === undefined) return data
  if (Array.isArray(data)) {
    return data.map((item) => redactRecursive(item, stripKeys)) as T
  }
  if (typeof data === "object" && data !== null) {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (stripKeys.has(key)) continue
      result[key] = redactRecursive(value, stripKeys)
    }
    return result as T
  }
  return data
}

/**
 * Fuzzy-match an offer title from a user query string.
 * Returns the best match or null.
 */
export function fuzzyMatchOffer<T extends { title: string }>(
  offers: T[],
  query: string,
): T | null {
  if (!offers.length || !query.trim()) return null

  const q = query.toLowerCase().trim()

  // Exact match first
  const exact = offers.find((o) => o.title.toLowerCase() === q)
  if (exact) return exact

  // Contains match
  const contains = offers.filter((o) => o.title.toLowerCase().includes(q))
  if (contains.length === 1) return contains[0]

  // Word overlap scoring
  const queryWords = q.split(/\s+/)
  let bestScore = 0
  let bestOffer: T | null = null

  for (const offer of offers) {
    const titleLower = offer.title.toLowerCase()
    const matchedWords = queryWords.filter((w) => titleLower.includes(w))
    const score = matchedWords.length / queryWords.length
    if (score > bestScore) {
      bestScore = score
      bestOffer = offer
    }
  }

  // Require at least 40% word overlap
  return bestScore >= 0.4 ? bestOffer : null
}
