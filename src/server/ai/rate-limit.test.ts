import { describe, test, expect, beforeEach } from "bun:test"

import { _resetRateLimitForTests, checkRateLimit } from "./rate-limit"

describe("rate-limit", () => {
  beforeEach(() => {
    _resetRateLimitForTests()
  })

  describe("checkRateLimit", () => {
    test("allows requests under limit", async () => {
      const result = await checkRateLimit({
        key: "test-key",
        limit: 5,
        windowMs: 60000,
      })

      expect(result.ok).toBe(true)
      expect(result.remaining).toBe(4)
      expect(result.retryAfterMs).toBe(0)
    })

    test("blocks requests over limit", async () => {
      const key = "test-key-limit"
      const limit = 2

      // First two requests should pass
      await checkRateLimit({ key, limit, windowMs: 60000 })
      await checkRateLimit({ key, limit, windowMs: 60000 })

      // Third request should be blocked
      const result = await checkRateLimit({ key, limit, windowMs: 60000 })
      expect(result.ok).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfterMs).toBeGreaterThan(0)
    })

    test("tracks different keys independently", async () => {
      const limit = 1

      await checkRateLimit({ key: "key-a", limit, windowMs: 60000 })
      await checkRateLimit({ key: "key-b", limit, windowMs: 60000 })

      // Both should be at their limit now
      const resultA = await checkRateLimit({ key: "key-a", limit, windowMs: 60000 })
      const resultB = await checkRateLimit({ key: "key-b", limit, windowMs: 60000 })

      expect(resultA.ok).toBe(false)
      expect(resultB.ok).toBe(false)
    })

    test("returns max remaining for zero or negative limit", async () => {
      const result = await checkRateLimit({
        key: "test-key",
        limit: 0,
        windowMs: 60000,
      })

      expect(result.ok).toBe(true)
      expect(result.remaining).toBe(Number.MAX_SAFE_INTEGER)
    })

    test("returns max remaining for zero or negative windowMs", async () => {
      const result = await checkRateLimit({
        key: "test-key",
        limit: 5,
        windowMs: 0,
      })

      expect(result.ok).toBe(true)
      expect(result.remaining).toBe(Number.MAX_SAFE_INTEGER)
    })

    test("resetAt is in the future", async () => {
      const now = Date.now()
      const windowMs = 60000

      const result = await checkRateLimit({
        key: "test-key",
        limit: 5,
        windowMs,
      })

      expect(result.resetAt).toBeGreaterThan(now)
      expect(result.resetAt).toBeLessThanOrEqual(now + windowMs)
    })

    test("remaining decreases with each request", async () => {
      const key = "decreasing-test"
      const limit = 10

      const results = []
      for (let i = 0; i < 5; i++) {
        const result = await checkRateLimit({ key, limit, windowMs: 60000 })
        results.push(result.remaining)
      }

      expect(results).toEqual([9, 8, 7, 6, 5])
    })
  })
})
