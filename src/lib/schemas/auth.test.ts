import { describe, test, expect } from "bun:test"

import {
  createLoginSchema,
  createResetPasswordSchema,
  createSignupSchema,
  errorMessage,
} from "./auth"

function t(key: string) {
  return `t:${key}`
}

describe("src/lib/schemas/auth", () => {
  describe("errorMessage", () => {
    test("should return string errors as-is", () => {
      expect(errorMessage("Something went wrong")).toBe("Something went wrong")
    })

    test("should extract message from { message } objects", () => {
      expect(errorMessage({ message: "Bad input" })).toBe("Bad input")
    })

    test("should stringify non-string messages", () => {
      expect(errorMessage({ message: 123 })).toBe("123")
    })

    test("should stringify unknown values", () => {
      expect(errorMessage(null)).toBe("null")
      expect(errorMessage(undefined)).toBe("undefined")
      expect(errorMessage(42)).toBe("42")
    })
  })

  describe("createLoginSchema", () => {
    test("should accept valid email + non-empty password", () => {
      const schema = createLoginSchema(t)
      const result = schema.safeParse({ email: "user@example.com", password: "pw" })
      expect(result.success).toBe(true)
    })

    test("should return translated errors for invalid inputs", () => {
      const schema = createLoginSchema(t)
      const result = schema.safeParse({ email: "not-an-email", password: "" })
      expect(result.success).toBe(false)

      if (!result.success) {
        const emailIssue = result.error.issues.find((i) => i.path[0] === "email")
        const passwordIssue = result.error.issues.find((i) => i.path[0] === "password")

        expect(emailIssue?.message).toBe("t:emailInvalid")
        expect(passwordIssue?.message).toBe("t:passwordRequired")
      }
    })
  })

  describe("createSignupSchema", () => {
    test("should accept valid inputs", () => {
      const schema = createSignupSchema(t)
      const result = schema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "12345678",
        confirmPassword: "12345678",
        agreeToTerms: true,
      })
      expect(result.success).toBe(true)
    })

    test("should not enforce cross-field constraints (confirm mismatch allowed)", () => {
      const schema = createSignupSchema(t)
      const result = schema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "12345678",
        confirmPassword: "different",
        agreeToTerms: false,
      })
      expect(result.success).toBe(true)
    })

    test("should return translated errors for invalid fields", () => {
      const schema = createSignupSchema(t)
      const result = schema.safeParse({
        name: "A",
        email: "not-an-email",
        password: "short",
        confirmPassword: "",
        agreeToTerms: false,
      })
      expect(result.success).toBe(false)

      if (!result.success) {
        const nameIssue = result.error.issues.find((i) => i.path[0] === "name")
        const emailIssue = result.error.issues.find((i) => i.path[0] === "email")
        const passwordIssue = result.error.issues.find((i) => i.path[0] === "password")
        const confirmIssue = result.error.issues.find(
          (i) => i.path[0] === "confirmPassword",
        )

        expect(nameIssue?.message).toBe("t:nameMin")
        expect(emailIssue?.message).toBe("t:emailInvalid")
        expect(passwordIssue?.message).toBe("t:passwordMin")
        expect(confirmIssue?.message).toBe("t:confirmRequired")
      }
    })
  })

  describe("createResetPasswordSchema", () => {
    test("should accept valid email", () => {
      const schema = createResetPasswordSchema(t)
      const result = schema.safeParse({ email: "user@example.com" })
      expect(result.success).toBe(true)
    })

    test("should return translated email error for invalid email", () => {
      const schema = createResetPasswordSchema(t)
      const result = schema.safeParse({ email: "not-an-email" })
      expect(result.success).toBe(false)

      if (!result.success) {
        const emailIssue = result.error.issues.find((i) => i.path[0] === "email")
        expect(emailIssue?.message).toBe("t:emailInvalid")
      }
    })
  })
})

