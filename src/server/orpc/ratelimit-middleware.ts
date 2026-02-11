import "server-only"

import { createRatelimitMiddleware } from "@orpc/experimental-ratelimit"
import { getRateLimiter } from "@/server/caching/redis-ratelimiter"
import { headers } from "next/headers"

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

  // If rate limiting is disabled, return a no-op middleware
  if (!limiter) {
    return createRatelimitMiddleware({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      limiter: () => null as unknown as any,
      key: () => "noop",
    })
  }

  return createRatelimitMiddleware({
    limiter: () => limiter,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    key: async ({ context }, _input) => {
      const headersList = await headers()
      const ip = headersList.get("x-forwarded-for") || 
                 headersList.get("x-real-ip") || 
                 "unknown"

      const userId = (context as { user?: { id: string } }).user?.id

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
    maxRequests: 20,
    windowMs: 60000,
    keyPrefix: keyPrefix || "assistant",
    keyGenerator: ({ userId }) => `user:${userId}`,
  })
}
