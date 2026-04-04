import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

const pingDatabaseMock = mock(async () => true)
const isRedisAvailableMock = mock(() => false)
const pingRedisMock = mock(async () => false)
const isRateLimitingEnabledMock = mock(() => false)
const isRateLimitingRequiredMock = mock(() => false)

mock.module("@/server/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: async () => [],
      }),
    }),
  },
  pingDatabase: pingDatabaseMock,
}))

mock.module("@/server/caching/redis", () => ({
  isRedisAvailable: isRedisAvailableMock,
  pingRedis: pingRedisMock,
}))

mock.module("@/server/caching/redis-ratelimiter", () => ({
  isRateLimitingEnabled: isRateLimitingEnabledMock,
  isRateLimitingRequired: isRateLimitingRequiredMock,
}))

describe("src/app/api/health/route", () => {
  const originalNodeEnv = process.env.NODE_ENV
  const setNodeEnv = (value: string) => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value,
      writable: true,
      configurable: true,
    })
  }

  beforeEach(() => {
    setNodeEnv("test")
    pingDatabaseMock.mockClear()
    isRedisAvailableMock.mockClear()
    pingRedisMock.mockClear()
    isRateLimitingEnabledMock.mockClear()
    isRateLimitingRequiredMock.mockClear()
  })

  afterAll(() => {
    setNodeEnv(originalNodeEnv ?? "test")
  })

  test("returns 200 and ok when required dependencies are healthy", async () => {
    pingDatabaseMock.mockResolvedValueOnce(true)
    isRedisAvailableMock.mockReturnValueOnce(false)
    isRateLimitingEnabledMock.mockReturnValueOnce(false)
    isRateLimitingRequiredMock.mockReturnValueOnce(false)

    const { GET } = await import("@/app/api/health/route")
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.status).toBe("ok")
    expect(body.checks.database).toMatchObject({ status: "up", required: true })
    expect(body.checks.redis).toMatchObject({
      status: "not_configured",
      required: false,
    })
    expect(body.checks.rateLimiter).toMatchObject({
      status: "disabled",
      enabled: false,
    })
  })

  test("returns 200 and degraded when redis is configured but unhealthy", async () => {
    pingDatabaseMock.mockResolvedValueOnce(true)
    isRedisAvailableMock.mockReturnValueOnce(true).mockReturnValueOnce(true)
    pingRedisMock.mockResolvedValueOnce(false)
    isRateLimitingEnabledMock.mockReturnValueOnce(true)
    isRateLimitingRequiredMock.mockReturnValueOnce(false)

    const { GET } = await import("@/app/api/health/route")
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.status).toBe("degraded")
    expect(body.checks.redis.status).toBe("down")
    expect(body.checks.rateLimiter.status).toBe("up")
  })

  test("returns 503 when database is unhealthy", async () => {
    pingDatabaseMock.mockResolvedValueOnce(false)
    isRedisAvailableMock.mockReturnValueOnce(true).mockReturnValueOnce(true)
    pingRedisMock.mockResolvedValueOnce(true)
    isRateLimitingEnabledMock.mockReturnValueOnce(true)
    isRateLimitingRequiredMock.mockReturnValueOnce(true)

    const { GET } = await import("@/app/api/health/route")
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.status).toBe("error")
    expect(body.checks.database.status).toBe("down")
  })

  test("redacts dependency checks in production responses", async () => {
    setNodeEnv("production")
    pingDatabaseMock.mockResolvedValueOnce(true)
    isRedisAvailableMock.mockReturnValueOnce(true).mockReturnValueOnce(true)
    pingRedisMock.mockResolvedValueOnce(false)
    isRateLimitingEnabledMock.mockReturnValueOnce(true)
    isRateLimitingRequiredMock.mockReturnValueOnce(false)

    const { GET } = await import("@/app/api/health/route")
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.status).toBe("degraded")
    expect(body.checks).toBeUndefined()
  })

  test("returns 200 and degraded in production when rate limiting falls back without Redis", async () => {
    setNodeEnv("production")
    pingDatabaseMock.mockResolvedValueOnce(true)
    isRedisAvailableMock.mockReturnValueOnce(false)
    isRateLimitingEnabledMock.mockReturnValueOnce(true)
    isRateLimitingRequiredMock.mockReturnValueOnce(false)

    const { GET } = await import("@/app/api/health/route")
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.status).toBe("degraded")
    expect(body.checks).toBeUndefined()
  })
})
