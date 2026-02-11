import "server-only"

import { env } from "@/env"

// Use any type to avoid importing bun at build time
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let redisClient: any | null = null

/**
 * Get or create the Redis client singleton.
 * Returns null if REDIS_URL is not configured.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getRedisClient(): any | null {
  if (!env.REDIS_URL) {
    return null
  }

  if (!redisClient) {
    // Dynamic import to avoid loading bun module at build time
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { RedisClient } = require("bun")
    redisClient = new RedisClient(env.REDIS_URL)
  }

  return redisClient
}

/**
 * Close the Redis connection.
 * Useful for graceful shutdowns.
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    redisClient.close()
    redisClient = null
  }
}

/**
 * Check if Redis is available (configured and connected).
 */
export function isRedisAvailable(): boolean {
  return env.REDIS_URL !== undefined && env.REDIS_URL !== ""
}
