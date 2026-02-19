import "server-only"

import Redis from "ioredis"
import { env } from "@/env"

let redisClient: Redis | null = null

/**
 * Get or create the Redis client singleton.
 * Returns null if REDIS_URL is not configured.
 */
export function getRedisClient(): Redis | null {
  if (!env.REDIS_URL) {
    return null
  }

  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
    })
  }

  return redisClient
}

/**
 * Close the Redis connection.
 * Useful for graceful shutdowns.
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}

/**
 * Check if Redis is available (configured and connected).
 */
export function isRedisAvailable(): boolean {
  return env.REDIS_URL !== undefined && env.REDIS_URL !== ""
}

/**
 * Lightweight readiness probe for Redis.
 * Returns false if Redis is not configured or if ping fails.
 */
export async function pingRedis(): Promise<boolean> {
  const client = getRedisClient()
  if (!client) {
    return false
  }

  try {
    const pong = await client.ping()
    return pong === "PONG"
  } catch {
    return false
  }
}
