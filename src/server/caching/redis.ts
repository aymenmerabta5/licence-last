import "server-only"

import { RedisClient } from "bun"
import { env } from "@/env"

let redisClient: RedisClient | null = null

/**
 * Get or create the Redis client singleton.
 * Returns null if REDIS_URL is not configured.
 */
export function getRedisClient(): RedisClient | null {
  if (!env.REDIS_URL) {
    return null
  }

  if (!redisClient) {
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
