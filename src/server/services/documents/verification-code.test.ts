import { describe, test, expect } from "bun:test"
import {
  generateVerificationCode,
  isValidVerificationCodeFormat,
} from "./verification-code"

describe("generateVerificationCode", () => {
  test("should produce INTX-XXXX-XXXX format", () => {
    const code = generateVerificationCode()
    expect(code).toMatch(/^INTX-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/)
  })

  test("should always be 14 characters long", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateVerificationCode()).toHaveLength(14)
    }
  })

  test("should not contain ambiguous characters O, I, 0, 1", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateVerificationCode()
      // Remove the prefix "INTX-" and dashes to check only random chars
      const randomPart = code.replace(/INTX-/g, "").replace(/-/g, "")
      expect(randomPart).not.toMatch(/[OI01]/)
    }
  })

  test("should generate unique codes", () => {
    const codes = new Set<string>()
    for (let i = 0; i < 1000; i++) {
      codes.add(generateVerificationCode())
    }
    expect(codes.size).toBe(1000)
  })
})

describe("isValidVerificationCodeFormat", () => {
  test("should accept valid codes", () => {
    expect(isValidVerificationCodeFormat("INTX-ABCD-EF23")).toBe(true)
    expect(isValidVerificationCodeFormat("INTX-2345-6789")).toBe(true)
    expect(isValidVerificationCodeFormat("INTX-WXYZ-HKLM")).toBe(true)
  })

  test("should reject codes with wrong prefix", () => {
    expect(isValidVerificationCodeFormat("XXXX-ABCD-EF23")).toBe(false)
    expect(isValidVerificationCodeFormat("ABCD-EF23")).toBe(false)
  })

  test("should reject codes with ambiguous characters", () => {
    expect(isValidVerificationCodeFormat("INTX-OIAB-CD01")).toBe(false)
  })

  test("should reject codes with wrong length", () => {
    expect(isValidVerificationCodeFormat("INTX-ABC-EF23")).toBe(false)
    expect(isValidVerificationCodeFormat("INTX-ABCDE-EF23")).toBe(false)
  })

  test("should reject lowercase codes", () => {
    expect(isValidVerificationCodeFormat("intx-abcd-ef23")).toBe(false)
  })

  test("should reject empty string", () => {
    expect(isValidVerificationCodeFormat("")).toBe(false)
  })
})
