import "server-only"

import { RedisRatelimiter } from "@orpc/experimental-ratelimit/redis"
import { getRedisClient, isRedisAvailable } from "./redis"
import { env } from "@/env"

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

  // Create the Redis rate limiter with Bun's Redis client
  // Note: Bun Redis uses send() for raw commands instead of direct method calls
  rateLimiter = new RedisRatelimiter({
    eval: async (script, numKeys, ...args) => {
      // Convert args to strings as required by Bun's Redis send()
      const stringArgs = args.map(arg => String(arg))
      return redis.send("EVAL", [script, String(numKeys), ...stringArgs])
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
