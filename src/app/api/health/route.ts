import { isRedisAvailable, pingRedis } from "@/server/caching/redis"
import { isRateLimitingEnabled } from "@/server/caching/redis-ratelimiter"
import * as dbModule from "@/server/db"

type CheckStatus = "up" | "down" | "not_configured" | "disabled"

interface HealthPayload {
  status: "ok" | "degraded" | "error"
  timestamp: number
  checks: {
    database: { status: CheckStatus; required: true }
    redis: { status: CheckStatus; required: false }
    rateLimiter: { status: CheckStatus; enabled: boolean }
  }
}

export async function GET() {
  const pingDatabase =
    typeof dbModule.pingDatabase === "function"
      ? dbModule.pingDatabase
      : async () => false

  const [databaseUp, redisUp] = await Promise.all([
    pingDatabase(),
    isRedisAvailable() ? pingRedis() : Promise.resolve(false),
  ])

  const redisConfigured = isRedisAvailable()
  const rateLimiterEnabled = isRateLimitingEnabled()

  const databaseStatus: CheckStatus = databaseUp ? "up" : "down"
  const redisStatus: CheckStatus = !redisConfigured
    ? "not_configured"
    : redisUp
      ? "up"
      : "down"
  const rateLimiterStatus: CheckStatus = !rateLimiterEnabled
    ? "disabled"
    : redisUp
      ? "up"
      : "down"

  const status: HealthPayload["status"] = !databaseUp
    ? "error"
    : redisConfigured && !redisUp
      ? "degraded"
      : "ok"

  const payload: HealthPayload = {
    status,
    timestamp: Date.now(),
    checks: {
      database: { status: databaseStatus, required: true },
      redis: { status: redisStatus, required: false },
      rateLimiter: { status: rateLimiterStatus, enabled: rateLimiterEnabled },
    },
  }

  return Response.json(payload, { status: status === "error" ? 503 : 200 })
}
