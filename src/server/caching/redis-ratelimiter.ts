import "server-only"

import { RedisRatelimiter } from "@orpc/experimental-ratelimit/redis"
import { env } from "@/env"
import { getRedisClient, isRedisAvailable } from "@/server/caching/redis"

let rateLimiter: RedisRatelimiter | null = null

/**
 * Get or create the Redis rate limiter singleton.
 * Returns null if rate limiting is disabled or Redis is not available.
 */
export function getRateLimiter(): RedisRatelimiter | null {
  // Check if rate limiting is enabled
  if (env.REDIS_RATE_LIMIT_ENABLED !== "true") {
    return null
  }

  // Check if Redis is available
  if (!isRedisAvailable()) {
    return null
  }

  // Return existing instance if already created
  if (rateLimiter) {
    return rateLimiter
  }

  const redis = getRedisClient()
  if (!redis) {
    return null
  }

  // ioredis .eval() runs Redis EVAL command (server-side Lua, not JS eval)
  rateLimiter = new RedisRatelimiter({
    eval: async (script, numKeys, ...args) => {
      return redis.eval(script, numKeys, ...args)
    },
    maxRequests: 100,
    window: 60000, // 60 seconds
    prefix: "orpc:ratelimit:",
  })

  return rateLimiter
}

/**
 * Reset the rate limiter (useful for testing).
 */
export function resetRateLimiter(): void {
  rateLimiter = null
}

/**
 * Check if rate limiting is active.
 */
export function isRateLimitingEnabled(): boolean {
  return env.REDIS_RATE_LIMIT_ENABLED === "true" && isRedisAvailable()
}
