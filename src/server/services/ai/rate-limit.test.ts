import { describe, expect, test } from "bun:test"

import { checkRateLimit, _resetRateLimitForTests } from "./rate-limit"

describe("checkRateLimit", () => {
  test("allows up to limit within window", () => {
    _resetRateLimitForTests()
    const now = 1_000

    expect(checkRateLimit({ key: "u1", limit: 2, windowMs: 1000, now }).ok).toBe(true)
    expect(checkRateLimit({ key: "u1", limit: 2, windowMs: 1000, now: now + 1 }).ok).toBe(true)
    expect(checkRateLimit({ key: "u1", limit: 2, windowMs: 1000, now: now + 2 }).ok).toBe(false)
  })

  test("resets after window", () => {
    _resetRateLimitForTests()
    const now = 5_000

    expect(checkRateLimit({ key: "u2", limit: 1, windowMs: 1000, now }).ok).toBe(true)
    expect(checkRateLimit({ key: "u2", limit: 1, windowMs: 1000, now: now + 10 }).ok).toBe(false)
    expect(checkRateLimit({ key: "u2", limit: 1, windowMs: 1000, now: now + 1000 }).ok).toBe(true)
  })
})
