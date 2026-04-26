import "server-only"

import { createRatelimitMiddleware } from "@orpc/experimental-ratelimit"
import { headers } from "next/headers"

import { env } from "@/env"
import { ASSISTANT_RATE_LIMIT } from "@/lib/constants/rate-limits"
import { getRateLimiter } from "@/server/caching/redis-ratelimiter"
import { createModuleLogger } from "@/server/logging"

const log = createModuleLogger("ratelimit")
const E2E_RATE_LIMIT_DISABLED = process.env.E2E_DISABLE_RATE_LIMIT === "1"

// Simple in-memory rate limit store (fallback when Redis is unavailable)
interface InMemoryRateLimitEntry {
  count: number
  resetAt: number
  touchedAt: number
}

const inMemoryStore = new Map<string, InMemoryRateLimitEntry>()
const IN_MEMORY_SWEEP_INTERVAL_MS = 5000
const DEFAULT_IN_MEMORY_MAX_KEYS = 10000
let inMemoryMaxKeys = DEFAULT_IN_MEMORY_MAX_KEYS
let lastInMemorySweepAt = 0
let hasLoggedRedisFallback = false

function sweepInMemoryStore(now: number): void {
  if (now - lastInMemorySweepAt < IN_MEMORY_SWEEP_INTERVAL_MS) {
    return
  }

  lastInMemorySweepAt = now

  for (const [key, entry] of inMemoryStore.entries()) {
    if (now > entry.resetAt) {
      inMemoryStore.delete(key)
    }
  }

  if (inMemoryStore.size <= inMemoryMaxKeys) {
    return
  }

  trimInMemoryStoreToMaxKeys()
}

function trimInMemoryStoreToMaxKeys(): void {
  if (inMemoryStore.size <= inMemoryMaxKeys) {
    return
  }

  const overflow = inMemoryStore.size - inMemoryMaxKeys
  const oldestEntries = [...inMemoryStore.entries()]
    .sort((a, b) => a[1].touchedAt - b[1].touchedAt)
    .slice(0, overflow)

  for (const [key] of oldestEntries) {
    inMemoryStore.delete(key)
  }
}

function checkInMemoryLimit(
  key: string,
  max: number,
  windowMs: number,
): boolean {
  const now = Date.now()
  sweepInMemoryStore(now)

  const entry = inMemoryStore.get(key)
  if (!entry || now > entry.resetAt) {
    inMemoryStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
      touchedAt: now,
    })
    trimInMemoryStoreToMaxKeys()
    return true
  }

  entry.count++
  entry.touchedAt = now

  return entry.count <= max
}

interface ContextWithUser {
  user?: { id: string }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
  /** Optional prefix for the rate limit key */
  keyPrefix?: string
  /** Custom key generator function */
  keyGenerator?: (ctx: { userId?: string; ip: string }) => string
}

export function __resetInMemoryRateLimiterForTests(): void {
  inMemoryStore.clear()
  inMemoryMaxKeys = DEFAULT_IN_MEMORY_MAX_KEYS
  lastInMemorySweepAt = 0
  hasLoggedRedisFallback = false
}

export function __setInMemoryRateLimiterMaxKeysForTests(maxKeys: number): void {
  inMemoryMaxKeys = Math.max(1, Math.floor(maxKeys))
}

export function __getInMemoryRateLimiterSizeForTests(): number {
  return inMemoryStore.size
}

export function __forceSweepInMemoryRateLimiterForTests(
  now = Date.now(),
): void {
  sweepInMemoryStore(now)
}

/**
 * Extract the client IP from x-forwarded-for.
 * Takes the first (leftmost) IP which is the original client,
 * assuming a trusted reverse proxy (Vercel, Cloudflare) that appends.
 * Falls back to x-real-ip or "unknown".
 */
function extractClientIp(headersList: Headers): string {
  // Prefer platform-specific headers that cannot be spoofed
  const vercelIp = headersList.get("x-vercel-forwarded-for")
  if (vercelIp) {
    return vercelIp.split(",")[0]?.trim()
  }

  const realIp = headersList.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }

  const forwarded = headersList.get("x-forwarded-for")
  if (forwarded) {
    // First entry is the original client when behind a trusted proxy
    return forwarded.split(",")[0]?.trim()
  }

  return "unknown"
}

/**
 * Default key generator - uses userId if available, otherwise IP
 */
function defaultKeyGenerator(ctx: { userId?: string; ip: string }): string {
  return ctx.userId ? `user:${ctx.userId}` : `ip:${ctx.ip}`
}

function createInMemoryLimiter(config: RateLimitConfig) {
  return {
    async limit(key: string) {
      const allowed = checkInMemoryLimit(
        key,
        config.maxRequests,
        config.windowMs,
      )
      const entry = inMemoryStore.get(key)
      const remaining = entry
        ? Math.max(0, config.maxRequests - entry.count)
        : config.maxRequests

      return {
        success: allowed,
        limit: config.maxRequests,
        remaining,
        reset: entry?.resetAt ?? Date.now() + config.windowMs,
      }
    },
  }
}

function logRedisFallbackOnce(isRedisRateLimitingEnabled: boolean): void {
  if (hasLoggedRedisFallback || process.env.NODE_ENV !== "production") {
    return
  }

  if (isRedisRateLimitingEnabled) {
    log.warn(
      "Redis unavailable while rate limiting is enabled - using in-memory fallback",
    )
  } else {
    log.warn("Redis unavailable - using in-memory rate limiter fallback")
  }

  hasLoggedRedisFallback = true
}

function createResilientLimiter(config: RateLimitConfig) {
  const fallbackLimiter = createInMemoryLimiter(config)

  return {
    async limit(key: string) {
      const redisLimiter = getRateLimiter()
      const isRedisRateLimitingEnabled = env.REDIS_RATE_LIMIT_ENABLED === "true"

      if (!redisLimiter) {
        logRedisFallbackOnce(isRedisRateLimitingEnabled)
        return fallbackLimiter.limit(key)
      }

      try {
        return await redisLimiter.limit(key)
      } catch (error) {
        log.warn(
          { err: error },
          "Redis rate limiter failed - using in-memory fallback",
        )
        logRedisFallbackOnce(isRedisRateLimitingEnabled)
        return fallbackLimiter.limit(key)
      }
    },
  }
}

/**
 * Create a rate limit middleware with custom configuration.
 *
 * @example
 * ```ts
 * const myProcedure = authedProcedure.use(
 *   createRateLimitMiddleware({
 *     maxRequests: 100,
 *     windowMs: 60000,
 *     keyPrefix: "api",
 *     keyGenerator: ({ userId }) => `user:${userId}`,
 *   })
 * )
 * ```
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  if (E2E_RATE_LIMIT_DISABLED) {
    return createRatelimitMiddleware({
      limiter: () =>
        createInMemoryLimiter({
          ...config,
          maxRequests: Number.MAX_SAFE_INTEGER,
          windowMs: 60_000,
        }),
      key: async ({ context }: { context: ContextWithUser }) => {
        const headersList = await headers()
        const ip = extractClientIp(headersList)
        const userId = (context as ContextWithUser).user?.id
        const keyGenerator = config.keyGenerator || defaultKeyGenerator
        const key = keyGenerator({ userId, ip })

        return config.keyPrefix ? `${config.keyPrefix}:${key}` : key
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  }

  const limiter = createResilientLimiter(config)

  return createRatelimitMiddleware({
    limiter: () => limiter,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    key: async ({ context }, _input) => {
      const headersList = await headers()
      const ip = extractClientIp(headersList)

      const userId = (context as ContextWithUser).user?.id

      const keyGenerator = config.keyGenerator || defaultKeyGenerator
      const key = keyGenerator({ userId, ip })

      return config.keyPrefix ? `${config.keyPrefix}:${key}` : key
    },
    // Override default maxRequests and window if provided
    ...({
      maxRequests: config.maxRequests,
      window: config.windowMs,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any),
  })
}

/**
 * Create a strict rate limit middleware for sensitive endpoints (auth, etc.)
 * 5 requests per minute
 */
export function createStrictRateLimitMiddleware(keyPrefix?: string) {
  return createRateLimitMiddleware({
    maxRequests: 5,
    windowMs: 60000,
    keyPrefix: keyPrefix || "strict",
    keyGenerator: ({ ip }) => `ip:${ip}`,
  })
}

/**
 * Create a standard rate limit middleware for general API usage
 * 100 requests per minute
 */
export function createStandardRateLimitMiddleware(keyPrefix?: string) {
  return createRateLimitMiddleware({
    maxRequests: 100,
    windowMs: 60000,
    keyPrefix: keyPrefix || "standard",
    keyGenerator: ({ userId, ip }) => (userId ? `user:${userId}` : `ip:${ip}`),
  })
}

/**
 * Create a generous rate limit middleware for read operations
 * 300 requests per minute
 */
export function createGenerousRateLimitMiddleware(keyPrefix?: string) {
  return createRateLimitMiddleware({
    maxRequests: 300,
    windowMs: 60000,
    keyPrefix: keyPrefix || "generous",
    keyGenerator: ({ userId, ip }) => (userId ? `user:${userId}` : `ip:${ip}`),
  })
}

/**
 * Create an AI/Assistant specific rate limit middleware
 * 20 requests per minute (AI calls are expensive)
 */
export function createAssistantRateLimitMiddleware(keyPrefix?: string) {
  return createRateLimitMiddleware({
    maxRequests: ASSISTANT_RATE_LIMIT.maxRequests,
    windowMs: ASSISTANT_RATE_LIMIT.windowMs,
    keyPrefix: keyPrefix || "assistant",
    keyGenerator: ({ userId }) => `user:${userId}`,
  })
}
