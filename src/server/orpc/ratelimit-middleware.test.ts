import { beforeEach, describe, expect, mock, test } from "bun:test"
import { ORPCError } from "@orpc/server"

let mockRedisRateLimitEnabled: "true" | "false" = "false"
let mockLimiter: object | null = null

mock.module("@orpc/experimental-ratelimit", () => ({
  createRatelimitMiddleware: (config: unknown) => config,
}))

mock.module("@/env", () => ({
  env: {
    get REDIS_RATE_LIMIT_ENABLED() {
      return mockRedisRateLimitEnabled
    },
  },
}))

mock.module("@/server/caching/redis-ratelimiter", () => ({
  getRateLimiter: () => mockLimiter,
  isRateLimitingEnabled: () => false,
}))

mock.module("next/headers", () => ({
  headers: async () => {
    const h = new Headers()
    h.set("x-real-ip", "127.0.0.1")
    return h
  },
}))

mock.module("@/server/logging", () => {
  const loggerMock = {
    trace: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    fatal: () => {},
    child: () => loggerMock,
  }

  return {
    logger: loggerMock,
    log: loggerMock,
    createLogger: () => loggerMock,
    createModuleLogger: () => loggerMock,
  }
})

describe("ratelimit middleware fallback policy", () => {
  const setNodeEnv = (value: string) => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value,
      writable: true,
      configurable: true,
    })
  }

  beforeEach(async () => {
    mockRedisRateLimitEnabled = "false"
    mockLimiter = null
    setNodeEnv("test")
    const { __resetInMemoryRateLimiterForTests } = await import(
      "@/server/orpc/ratelimit-middleware"
    )
    __resetInMemoryRateLimiterForTests()
  })

  test("fails closed in production when Redis-backed rate limiting is enabled but unavailable", async () => {
    setNodeEnv("production")
    mockRedisRateLimitEnabled = "true"
    mockLimiter = null

    const { createRateLimitMiddleware } = await import(
      "@/server/orpc/ratelimit-middleware"
    )
    const middleware = createRateLimitMiddleware({
      maxRequests: 5,
      windowMs: 60_000,
      keyPrefix: "test",
    }) as unknown as { key: (args: { context: unknown }) => Promise<string> }

    let thrown: unknown = null
    try {
      await middleware.key({ context: {} })
    } catch (error) {
      thrown = error
    }

    expect(thrown instanceof ORPCError).toBe(true)
    expect((thrown as Error).message).toContain(
      "Rate limiter backend unavailable",
    )
  })

  test("uses in-memory fallback when Redis-backed rate limiting is disabled", async () => {
    mockRedisRateLimitEnabled = "false"
    mockLimiter = null

    const { createRateLimitMiddleware } = await import(
      "@/server/orpc/ratelimit-middleware"
    )
    const middleware = createRateLimitMiddleware({
      maxRequests: 2,
      windowMs: 60_000,
      keyPrefix: "test",
      keyGenerator: () => "user:test-user",
    }) as unknown as { key: (args: { context: unknown }) => Promise<string> }

    await middleware.key({ context: {} })
    await middleware.key({ context: {} })

    let thrown: unknown = null
    try {
      await middleware.key({ context: {} })
    } catch (error) {
      thrown = error
    }

    expect(thrown instanceof Error).toBe(true)
    expect((thrown as Error).message).toBe("Rate limit exceeded")
  })

  test("caps in-memory fallback keys to avoid unbounded growth", async () => {
    mockRedisRateLimitEnabled = "false"
    mockLimiter = null

    const {
      createRateLimitMiddleware,
      __setInMemoryRateLimiterMaxKeysForTests,
      __getInMemoryRateLimiterSizeForTests,
    } = await import("@/server/orpc/ratelimit-middleware")

    __setInMemoryRateLimiterMaxKeysForTests(2)

    const middleware = createRateLimitMiddleware({
      maxRequests: 10,
      windowMs: 60_000,
      keyPrefix: "test",
    }) as unknown as {
      key: (args: { context: { user: { id: string } } }) => Promise<string>
    }

    await middleware.key({ context: { user: { id: "u1" } } })
    await middleware.key({ context: { user: { id: "u2" } } })
    await middleware.key({ context: { user: { id: "u3" } } })

    expect(__getInMemoryRateLimiterSizeForTests()).toBe(2)
  })

  test("sweeps expired keys from in-memory fallback store", async () => {
    mockRedisRateLimitEnabled = "false"
    mockLimiter = null

    const {
      createRateLimitMiddleware,
      __getInMemoryRateLimiterSizeForTests,
      __forceSweepInMemoryRateLimiterForTests,
    } = await import("@/server/orpc/ratelimit-middleware")

    const middleware = createRateLimitMiddleware({
      maxRequests: 5,
      windowMs: 5,
      keyPrefix: "test",
    }) as unknown as {
      key: (args: { context: { user: { id: string } } }) => Promise<string>
    }

    await middleware.key({ context: { user: { id: "u1" } } })
    expect(__getInMemoryRateLimiterSizeForTests()).toBe(1)

    await new Promise((resolve) => setTimeout(resolve, 10))
    await middleware.key({ context: { user: { id: "u2" } } })
    __forceSweepInMemoryRateLimiterForTests(Date.now() + 6000)

    expect(__getInMemoryRateLimiterSizeForTests()).toBe(0)
  })
})
