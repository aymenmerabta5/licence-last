import { describe, expect, test } from "bun:test"

describe("src/server/orpc/utils/ai-error", () => {
  test("maps AI rate limit responses to too many requests", async () => {
    const mod = await import(`@/server/orpc/utils/ai-error?test=${Date.now()}`)

    expect(() =>
      mod.throwAIOrpcError(
        Object.assign(new Error("rate limited"), { statusCode: 429 }),
      ),
    ).toThrow(
      "AI service is temporarily rate limited. Please try again shortly.",
    )
  })

  test("maps transient AI failures to service unavailable", async () => {
    const mod = await import(`@/server/orpc/utils/ai-error?test=${Date.now()}`)

    expect(() => mod.throwAIOrpcError(new Error("timeout"))).toThrow(
      "AI service is temporarily unavailable. Please try again shortly.",
    )
  })
})
