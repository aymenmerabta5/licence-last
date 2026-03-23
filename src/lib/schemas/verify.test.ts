import { describe, expect, test } from "bun:test"
import { createVerifyCodeSchema, verifyCodeSchema } from "@/lib/schemas/verify"

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

  test("should use translated validation messages in the schema factory", () => {
    const schema = createVerifyCodeSchema((key) => `t:${key}`)
    const empty = schema.safeParse({ code: "" })
    const tooLong = schema.safeParse({ code: "A".repeat(21) })

    expect(empty.success).toBe(false)
    expect(tooLong.success).toBe(false)

    if (!empty.success) {
      expect(empty.error.issues[0]?.message).toBe("t:verifyCodeRequired")
    }

    if (!tooLong.success) {
      expect(tooLong.error.issues[0]?.message).toBe("t:verifyCodeMax")
    }
  })
})
