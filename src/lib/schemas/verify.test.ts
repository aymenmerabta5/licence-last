import { describe, test, expect } from "bun:test"
import { verifyCodeSchema } from "./verify"

describe("verifyCodeSchema", () => {
  test("should accept valid verification code", () => {
    const result = verifyCodeSchema.safeParse({ code: "INTX-ABCD-EF23" })
    expect(result.success).toBe(true)
  })

  test("should trim whitespace", () => {
    const result = verifyCodeSchema.safeParse({ code: "  INTX-ABCD-EF23  " })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.code).toBe("INTX-ABCD-EF23")
    }
  })

  test("should uppercase the input", () => {
    const result = verifyCodeSchema.safeParse({ code: "intx-abcd-ef23" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.code).toBe("INTX-ABCD-EF23")
    }
  })

  test("should reject empty code", () => {
    const result = verifyCodeSchema.safeParse({ code: "" })
    expect(result.success).toBe(false)
  })

  test("should reject code exceeding max length", () => {
    const result = verifyCodeSchema.safeParse({ code: "A".repeat(21) })
    expect(result.success).toBe(false)
  })

  test("should accept short partial codes", () => {
    // Users might enter partial codes; schema allows anything 1-20 chars
    const result = verifyCodeSchema.safeParse({ code: "INTX" })
    expect(result.success).toBe(true)
  })
})
