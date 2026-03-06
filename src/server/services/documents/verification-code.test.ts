import { describe, expect, test } from "bun:test"

async function loadVerificationCodeModule() {
  return (await import(
    `@/server/services/documents/verification-code?test=${Date.now()}-${Math.random()}`
  )) as typeof import("@/server/services/documents/verification-code")
}

describe("generateVerificationCode", () => {
  test("should produce INTX-XXXX-XXXX format", async () => {
    const { generateVerificationCode } = await loadVerificationCodeModule()
    const code = generateVerificationCode()
    expect(code).toMatch(/^INTX-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/)
  })

  test("should always be 14 characters long", async () => {
    const { generateVerificationCode } = await loadVerificationCodeModule()
    for (let i = 0; i < 50; i++) {
      expect(generateVerificationCode()).toHaveLength(14)
    }
  })

  test("should not contain ambiguous characters O, I, 0, 1", async () => {
    const { generateVerificationCode } = await loadVerificationCodeModule()
    for (let i = 0; i < 100; i++) {
      const code = generateVerificationCode()
      // Remove the prefix "INTX-" and dashes to check only random chars
      const randomPart = code.replace(/INTX-/g, "").replace(/-/g, "")
      expect(randomPart).not.toMatch(/[OI01]/)
    }
  })

  test("should generate unique codes", async () => {
    const { generateVerificationCode } = await loadVerificationCodeModule()
    const codes = new Set<string>()
    for (let i = 0; i < 1000; i++) {
      codes.add(generateVerificationCode())
    }
    expect(codes.size).toBe(1000)
  })
})

describe("isValidVerificationCodeFormat", () => {
  test("should accept valid codes", async () => {
    const { isValidVerificationCodeFormat } = await loadVerificationCodeModule()
    expect(isValidVerificationCodeFormat("INTX-ABCD-EF23")).toBe(true)
    expect(isValidVerificationCodeFormat("INTX-2345-6789")).toBe(true)
    expect(isValidVerificationCodeFormat("INTX-WXYZ-HKLM")).toBe(true)
  })

  test("should reject codes with wrong prefix", async () => {
    const { isValidVerificationCodeFormat } = await loadVerificationCodeModule()
    expect(isValidVerificationCodeFormat("XXXX-ABCD-EF23")).toBe(false)
    expect(isValidVerificationCodeFormat("ABCD-EF23")).toBe(false)
  })

  test("should reject codes with ambiguous characters", async () => {
    const { isValidVerificationCodeFormat } = await loadVerificationCodeModule()
    expect(isValidVerificationCodeFormat("INTX-OIAB-CD01")).toBe(false)
  })

  test("should reject codes with wrong length", async () => {
    const { isValidVerificationCodeFormat } = await loadVerificationCodeModule()
    expect(isValidVerificationCodeFormat("INTX-ABC-EF23")).toBe(false)
    expect(isValidVerificationCodeFormat("INTX-ABCDE-EF23")).toBe(false)
  })

  test("should reject lowercase codes", async () => {
    const { isValidVerificationCodeFormat } = await loadVerificationCodeModule()
    expect(isValidVerificationCodeFormat("intx-abcd-ef23")).toBe(false)
  })

  test("should reject empty string", async () => {
    const { isValidVerificationCodeFormat } = await loadVerificationCodeModule()
    expect(isValidVerificationCodeFormat("")).toBe(false)
  })
})
