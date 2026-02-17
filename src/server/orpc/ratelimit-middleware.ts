import "server-only"

import { createRatelimitMiddleware } from "@orpc/experimental-ratelimit"
import { ORPCError } from "@orpc/server"
import { headers } from "next/headers"

import { env } from "@/env"
import { ASSISTANT_RATE_LIMIT } from "@/lib/constants/rate-limits"
import { getRateLimiter } from "@/server/caching/redis-ratelimiter"
import { createModuleLogger } from "@/server/logging"

const log = createModuleLogger("ratelimit")

// Simple in-memory rate limit store (fallback when Redis is unavailable)
const inMemoryStore = new Map<string, { count: number; resetAt: number }>()

function checkInMemoryLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = inMemoryStore.get(key)
  if (!entry || now > entry.resetAt) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  entry.count++
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
    return vercelIp.split(",")[0]!.trim()
  }

  const realIp = headersList.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }

  const forwarded = headersList.get("x-forwarded-for")
  if (forwarded) {
    // First entry is the original client when behind a trusted proxy
    return forwarded.split(",")[0]!.trim()
  }

  return "unknown"
}

/**
 * Default key generator - uses userId if available, otherwise IP
 */
function defaultKeyGenerator(ctx: { userId?: string; ip: string }): string {
  return ctx.userId ? `user:${ctx.userId}` : `ip:${ctx.ip}`
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
  const limiter = getRateLimiter()
  const isRedisRateLimitingEnabled = env.REDIS_RATE_LIMIT_ENABLED === "true"

  // If Redis is unavailable, fail closed in production when Redis-backed
  // rate limiting is explicitly enabled.
  if (!limiter) {
    if (process.env.NODE_ENV === "production" && isRedisRateLimitingEnabled) {
      log.error("Redis unavailable while rate limiting is enabled - failing closed")
      return createRatelimitMiddleware({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        limiter: () => null as unknown as any,
        key: async () => {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Rate limiter backend unavailable",
          })
        },
      })
    }

    if (process.env.NODE_ENV === "production") {
      log.warn("Redis unavailable - using in-memory rate limiter fallback")
    }
    return createRatelimitMiddleware({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      limiter: () => null as unknown as any,
      key: async ({ context }) => {
        const headersList = await headers()
        const ip = extractClientIp(headersList)
        const userId = (context as ContextWithUser).user?.id
        const keyGenerator = config.keyGenerator || defaultKeyGenerator
        const fullKey = config.keyPrefix
          ? `${config.keyPrefix}:${keyGenerator({ userId, ip })}`
          : keyGenerator({ userId, ip })

        if (!checkInMemoryLimit(fullKey, config.maxRequests, config.windowMs)) {
          throw new Error("Rate limit exceeded")
        }
        return fullKey
      },
    })
  }

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
    keyGenerator: ({ userId, ip }) => userId ? `user:${userId}` : `ip:${ip}`,
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
    keyGenerator: ({ userId, ip }) => userId ? `user:${userId}` : `ip:${ip}`,
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
