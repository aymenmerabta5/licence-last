import { describe, test, expect } from "bun:test"

import { createCompanyOnboardingSchema } from "./company"

function t(key: string) {
  return `t:${key}`
}

describe("src/lib/schemas/company", () => {
  describe("createCompanyOnboardingSchema", () => {
    test("should accept minimal valid input and coerce wilayaCode", () => {
      const schema = createCompanyOnboardingSchema(t)
      const result = schema.safeParse({
        name: "Acme",
        websiteUrl: "",
        wilayaCode: "5",
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.wilayaCode).toBe(5)
        expect(result.data.websiteUrl).toBe("")
      }
    })

    test("should accept undefined websiteUrl", () => {
      const schema = createCompanyOnboardingSchema(t)
      const result = schema.safeParse({
        name: "Acme",
        wilayaCode: 1,
      })
      expect(result.success).toBe(true)
    })

    test("should reject invalid websiteUrl with translated message", () => {
      const schema = createCompanyOnboardingSchema(t)
      const result = schema.safeParse({
        name: "Acme",
        websiteUrl: "not-a-url",
        wilayaCode: 1,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "websiteUrl")
        expect(issue?.message).toBe("t:websiteUrlInvalid")
      }
    })

    test("should reject wilayaCode below minimum with translated message", () => {
      const schema = createCompanyOnboardingSchema(t)
      const result = schema.safeParse({
        name: "Acme",
        wilayaCode: "0",
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "wilayaCode")
        expect(issue?.message).toBe("t:wilayaRequired")
      }
    })

    test("should reject wilayaCode above maximum with translated message", () => {
      const schema = createCompanyOnboardingSchema(t)
      const result = schema.safeParse({
        name: "Acme",
        wilayaCode: 59,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "wilayaCode")
        expect(issue?.message).toBe("t:wilayaInvalid")
      }
    })

    test("should reject short company name with translated message", () => {
      const schema = createCompanyOnboardingSchema(t)
      const result = schema.safeParse({
        name: "A",
        wilayaCode: 1,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "name")
        expect(issue?.message).toBe("t:companyNameMin")
      }
    })
  })
})

