import "server-only"

import { env } from "@/env"

interface BunRedisClient {
  send(command: string, args: string[]): Promise<unknown>
  close(): void
}

let redisClient: BunRedisClient | null = null

/**
 * Get or create the Redis client singleton.
 * Returns null if REDIS_URL is not configured.
 */
export function getRedisClient(): BunRedisClient | null {
  if (!env.REDIS_URL) {
    return null
  }

  if (!redisClient) {
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
