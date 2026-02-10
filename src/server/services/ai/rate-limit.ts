import "server-only"

interface RateLimitOptions {
  key: string
  limit: number
  windowMs: number
  now?: number
}

interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: number
  retryAfterMs: number
}

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export function checkRateLimit({
  key,
  limit,
  windowMs,
  now = Date.now(),
}: RateLimitOptions): RateLimitResult {
  if (limit <= 0 || windowMs <= 0) {
    return {
      ok: true,
      remaining: Number.MAX_SAFE_INTEGER,
      resetAt: now,
      retryAfterMs: 0,
    }
  }

  const existing = buckets.get(key)
  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return {
      ok: true,
      remaining: Math.max(0, limit - 1),
      resetAt,
      retryAfterMs: 0,
    }
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterMs: Math.max(0, existing.resetAt - now),
    }
  }

  existing.count += 1
  buckets.set(key, existing)

  return {
    ok: true,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
    retryAfterMs: 0,
  }
}

export function _resetRateLimitForTests() {
  buckets.clear()
}
