import { describe, expect, test } from "bun:test"

import { createCompanyOnboardingSchema } from "@/lib/schemas/company"

function t(key: string) {
  return `t:${key}`
}

function createVerificationDocument(
  type = "application/pdf",
  name = "verification.pdf",
) {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37])
  const blob = new Blob([bytes], { type })
  return new File([blob], name, { type })
}

describe("src/lib/schemas/company", () => {
  describe("createCompanyOnboardingSchema", () => {
    test("should accept minimal valid input and coerce wilayaCode", () => {
      const schema = createCompanyOnboardingSchema(t)
      const result = schema.safeParse({
        name: "Acme",
        websiteUrl: "",
        wilayaCode: "5",
        verificationDocument: createVerificationDocument(),
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
        verificationDocument: createVerificationDocument(),
      })
      expect(result.success).toBe(true)
    })

    test("should reject invalid websiteUrl with translated message", () => {
      const schema = createCompanyOnboardingSchema(t)
      const result = schema.safeParse({
        name: "Acme",
        websiteUrl: "not-a-url",
        wilayaCode: 1,
        verificationDocument: createVerificationDocument(),
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "websiteUrl",
        )
        expect(issue?.message).toBe("t:websiteUrlInvalid")
      }
    })

    test("should reject wilayaCode below minimum with translated message", () => {
      const schema = createCompanyOnboardingSchema(t)
      const result = schema.safeParse({
        name: "Acme",
        wilayaCode: "0",
        verificationDocument: createVerificationDocument(),
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "wilayaCode",
        )
        expect(issue?.message).toBe("t:wilayaRequired")
      }
    })

    test("should reject wilayaCode above maximum with translated message", () => {
      const schema = createCompanyOnboardingSchema(t)
      const result = schema.safeParse({
        name: "Acme",
        wilayaCode: 59,
        verificationDocument: createVerificationDocument(),
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "wilayaCode",
        )
        expect(issue?.message).toBe("t:wilayaInvalid")
      }
    })

    test("should reject short company name with translated message", () => {
      const schema = createCompanyOnboardingSchema(t)
      const result = schema.safeParse({
        name: "A",
        wilayaCode: 1,
        verificationDocument: createVerificationDocument(),
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "name")
        expect(issue?.message).toBe("t:companyNameMin")
      }
    })

    test("should reject missing verificationDocument with translated message", () => {
      const schema = createCompanyOnboardingSchema(t)
      const result = schema.safeParse({
        name: "Acme",
        wilayaCode: 1,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "verificationDocument",
        )
        expect(issue?.message).toBe("t:companyVerificationDocumentRequired")
      }
    })

    test("should reject unsupported verificationDocument type", () => {
      const schema = createCompanyOnboardingSchema(t)
      const result = schema.safeParse({
        name: "Acme",
        wilayaCode: 1,
        verificationDocument: createVerificationDocument("application/msword"),
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "verificationDocument",
        )
        expect(issue?.message).toBe("t:companyVerificationDocumentType")
      }
    })
  })
})
