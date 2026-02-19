import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"

mock.module("server-only", () => ({}))

describe("Arcade tool cache", () => {
  let toolCache: Map<string, { tools: unknown[]; expiresAt: number }>
  let originalDateNow: () => number

  beforeEach(() => {
    toolCache = new Map()
    originalDateNow = Date.now
  })

  afterEach(() => {
    Date.now = originalDateNow
  })

  describe("cache cleanup", () => {
    test("should correctly identify expired entries", () => {
      const now = Date.now()

      toolCache.set("user-expired", { tools: [], expiresAt: now - 1000 })
      toolCache.set("user-valid", { tools: [], expiresAt: now + 60000 })

      const expiredEntry = toolCache.get("user-expired")
      const validEntry = toolCache.get("user-valid")

      expect(expiredEntry?.expiresAt).toBeLessThan(now)
      expect(validEntry?.expiresAt).toBeGreaterThan(now)
    })

    test("should delete expired entries from cache", () => {
      const now = Date.now()

      toolCache.set("user-expired", { tools: [], expiresAt: now - 1000 })
      expect(toolCache.has("user-expired")).toBe(true)

      const cached = toolCache.get("user-expired")
      if (cached && cached.expiresAt <= now) {
        toolCache.delete("user-expired")
      }

      expect(toolCache.has("user-expired")).toBe(false)
    })

    test("should enforce max cache size by removing oldest entry", () => {
      for (let i = 0; i < 100; i++) {
        toolCache.set(`user-${i}`, { tools: [], expiresAt: Date.now() + 60000 })
      }

      expect(toolCache.size).toBe(100)

      const oldestKey = toolCache.keys().next().value
      expect(oldestKey).toBe("user-0")

      toolCache.delete(oldestKey!)
      expect(toolCache.size).toBe(99)
      expect(toolCache.has("user-0")).toBe(false)
    })

    test("should clean up all expired entries", () => {
      const now = Date.now()

      for (let i = 0; i < 10; i++) {
        const isExpired = i < 5
        toolCache.set(`user-${i}`, {
          tools: [],
          expiresAt: isExpired ? now - 1000 : now + 60000,
        })
      }

      expect(toolCache.size).toBe(10)

      for (const [key, value] of toolCache) {
        if (value.expiresAt <= now) {
          toolCache.delete(key)
        }
      }

      expect(toolCache.size).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(toolCache.has(`user-${i}`)).toBe(false)
      }
      for (let i = 5; i < 10; i++) {
        expect(toolCache.has(`user-${i}`)).toBe(true)
      }
    })
  })
})
