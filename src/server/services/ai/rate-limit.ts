import "server-only"

import { lt, sql } from "drizzle-orm"

interface RateLimitOptions {
  key: string
  limit: number
  windowMs: number
  now?: number
  store?: RateLimitStore
}

interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: number
  retryAfterMs: number
}

interface RateLimitStore {
  increment(input: {
    key: string
    windowMs: number
    windowStartMs: number
    nowMs: number
  }): Promise<number>
}

type InMemoryBucket = {
  count: number
  resetAt: number
}

const inMemoryBuckets = new Map<string, InMemoryBucket>()
let lastCleanupAtMs = 0

const inMemoryStore: RateLimitStore = {
  async increment({ key, windowMs, windowStartMs }) {
    const bucketKey = `${key}:${windowMs}:${windowStartMs}`
    const resetAt = windowStartMs + windowMs
    const existing = inMemoryBuckets.get(bucketKey)

    if (!existing) {
      inMemoryBuckets.set(bucketKey, { count: 1, resetAt })
      return 1
    }

    existing.count += 1
    inMemoryBuckets.set(bucketKey, existing)
    return existing.count
  },
}

const dbStore: RateLimitStore = {
  async increment({ key, windowMs, windowStartMs, nowMs }) {
    const [{ db }, { rateLimitBucket }] = await Promise.all([
      import("@/server/db"),
      import("@/server/db/schema/rate-limits"),
    ])

    const now = new Date(nowMs)
    const windowStart = new Date(windowStartMs)

    const [row] = await db
      .insert(rateLimitBucket)
      .values({
        bucketKey: key,
        windowMs,
        windowStart,
        count: 1,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          rateLimitBucket.bucketKey,
          rateLimitBucket.windowMs,
          rateLimitBucket.windowStart,
        ],
        set: {
          count: sql`${rateLimitBucket.count} + 1`,
          updatedAt: now,
        },
      })
      .returning({ count: rateLimitBucket.count })

    // Periodic cleanup to keep the table bounded.
    const cleanupEveryMs = 5 * 60 * 1000
    if (nowMs - lastCleanupAtMs > cleanupEveryMs) {
      lastCleanupAtMs = nowMs
      const pruneBefore = new Date(nowMs - 24 * 60 * 60 * 1000)
      void db
        .delete(rateLimitBucket)
        .where(lt(rateLimitBucket.updatedAt, pruneBefore))
        .catch(() => undefined)
    }

    return row?.count ?? 1
  },
}

function getDefaultStore(): RateLimitStore {
  return process.env.NODE_ENV === "test" ? inMemoryStore : dbStore
}

export async function checkRateLimit({
  key,
  limit,
  windowMs,
  now = Date.now(),
  store = getDefaultStore(),
}: RateLimitOptions): Promise<RateLimitResult> {
  if (limit <= 0 || windowMs <= 0) {
    return {
      ok: true,
      remaining: Number.MAX_SAFE_INTEGER,
      resetAt: now,
      retryAfterMs: 0,
    }
  }

  const windowStartMs = Math.floor(now / windowMs) * windowMs
  const resetAt = windowStartMs + windowMs

  const count = await store.increment({
    key,
    windowMs,
    windowStartMs,
    nowMs: now,
  })

  const remaining = Math.max(0, limit - count)
  const ok = count <= limit

  return {
    ok,
    remaining,
    resetAt,
    retryAfterMs: ok ? 0 : Math.max(0, resetAt - now),
  }
}

export function _resetRateLimitForTests() {
  inMemoryBuckets.clear()
  lastCleanupAtMs = 0
}
