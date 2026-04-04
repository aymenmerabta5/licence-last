type CheckStatus = "up" | "down" | "not_configured" | "disabled"
type HealthStatus = "ok" | "degraded" | "error"

interface PublicHealthPayload {
  status: HealthStatus
  timestamp: number
}

interface HealthPayload extends PublicHealthPayload {
  checks: {
    database: { status: CheckStatus; required: true }
    redis: { status: CheckStatus; required: false }
    rateLimiter: { status: CheckStatus; enabled: boolean }
  }
}

export async function GET() {
  const [{ isRedisAvailable, pingRedis }, rateLimiterModule, dbModule] =
    await Promise.all([
      import("@/server/caching/redis"),
      import("@/server/caching/redis-ratelimiter"),
      import("@/server/db"),
    ])

  const { isRateLimitingEnabled, isRateLimitingRequired } = rateLimiterModule

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
  const rateLimiterRequired = isRateLimitingRequired()

  const databaseStatus: CheckStatus = databaseUp ? "up" : "down"
  const redisStatus: CheckStatus = !redisConfigured
    ? "not_configured"
    : redisUp
      ? "up"
      : "down"
  const rateLimiterStatus: CheckStatus = !rateLimiterEnabled
    ? "disabled"
    : rateLimiterRequired && !redisUp
      ? "down"
      : "up"

  const status: HealthStatus = !databaseUp
    ? "error"
    : rateLimiterRequired && !redisUp
      ? "error"
      : rateLimiterEnabled && (!redisConfigured || !redisUp)
        ? "degraded"
        : redisConfigured && !redisUp
          ? "degraded"
          : "ok"
  const timestamp = Date.now()
  const responseStatus = status === "error" ? 503 : 200

  if (process.env.NODE_ENV === "production") {
    const payload: PublicHealthPayload = {
      status,
      timestamp,
    }

    return Response.json(payload, { status: responseStatus })
  }

  const payload: HealthPayload = {
    status,
    timestamp,
    checks: {
      database: { status: databaseStatus, required: true },
      redis: { status: redisStatus, required: false },
      rateLimiter: { status: rateLimiterStatus, enabled: rateLimiterEnabled },
    },
  }

  return Response.json(payload, { status: responseStatus })
}
