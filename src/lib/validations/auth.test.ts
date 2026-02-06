import { describe, test, expect } from "bun:test"
import {
  errorMessage,
  createLoginSchema,
  createSignupSchema,
  createResetPasswordSchema,
  type TranslationFn,
} from "./auth"

// Mock translation function for testing
const mockT: TranslationFn = (key: string) => {
  const translations: Record<string, string> = {
    emailInvalid: "Invalid email address",
    passwordRequired: "Password is required",
    nameMin: "Name must be at least 2 characters",
    passwordMin: "Password must be at least 8 characters",
    confirmRequired: "Please confirm your password",
  }
  return translations[key] || key
}

describe("errorMessage utility", () => {
  describe("string input", () => {
    test("should return the string directly", () => {
      const result = errorMessage("This is an error")
      expect(result).toBe("This is an error")
    })

    test("should handle empty string", () => {
      const result = errorMessage("")
      expect(result).toBe("")
    })
  })

  describe("object with message property", () => {
    test("should extract message from error object", () => {
      const error = { message: "Validation failed" }
      const result = errorMessage(error)
      expect(result).toBe("Validation failed")
    })

    test("should handle error object with additional properties", () => {
      const error = { message: "Invalid field", path: ["email"], code: "invalid" }
      const result = errorMessage(error)
      expect(result).toBe("Invalid field")
    })

    test("should convert non-string message to string", () => {
      const error = { message: 123 }
      const result = errorMessage(error)
      expect(result).toBe("123")
    })
  })

  describe("other types", () => {
    test("should convert number to string", () => {
      const result = errorMessage(42)
      expect(result).toBe("42")
    })

    test("should convert null to string", () => {
      const result = errorMessage(null)
      expect(result).toBe("null")
    })

    test("should convert undefined to string", () => {
      const result = errorMessage(undefined)
      expect(result).toBe("undefined")
    })

    test("should convert boolean to string", () => {
      const result = errorMessage(false)
      expect(result).toBe("false")
    })

    test("should convert object without message to string", () => {
      const error = { code: "ERR_001" }
      const result = errorMessage(error)
      expect(result).toBe("[object Object]")
    })

    test("should handle array input", () => {
      const result = errorMessage(["error1", "error2"])
      expect(result).toBe("error1,error2")
    })
  })
})

describe("createLoginSchema", () => {
  const schema = createLoginSchema(mockT)

  describe("valid inputs", () => {
    test("should accept valid email and password", () => {
      const result = schema.safeParse({
        email: "user@example.com",
        password: "password123",
      })
      expect(result.success).toBe(true)
    })

    test("should accept email with subdomain", () => {
      const result = schema.safeParse({
        email: "user@subdomain.example.com",
        password: "password123",
      })
      expect(result.success).toBe(true)
    })

    test("should accept email with plus sign", () => {
      const result = schema.safeParse({
        email: "user+tag@example.com",
        password: "password123",
      })
      expect(result.success).toBe(true)
    })

    test("should accept single character password", () => {
      const result = schema.safeParse({
        email: "user@example.com",
        password: "x",
      })
      expect(result.success).toBe(true)
    })
  })

  describe("invalid email", () => {
    test("should reject empty email", () => {
      const result = schema.safeParse({
        email: "",
        password: "password123",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid email address")
      }
    })

    test("should reject email without @", () => {
      const result = schema.safeParse({
        email: "userexample.com",
        password: "password123",
      })
      expect(result.success).toBe(false)
    })

    test("should reject email without domain", () => {
      const result = schema.safeParse({
        email: "user@",
        password: "password123",
      })
      expect(result.success).toBe(false)
    })

    test("should reject email without local part", () => {
      const result = schema.safeParse({
        email: "@example.com",
        password: "password123",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("invalid password", () => {
    test("should reject empty password", () => {
      const result = schema.safeParse({
        email: "user@example.com",
        password: "",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password is required")
      }
    })
  })

  describe("missing fields", () => {
    test("should reject missing email", () => {
      const result = schema.safeParse({
        password: "password123",
      })
      expect(result.success).toBe(false)
    })

    test("should reject missing password", () => {
      const result = schema.safeParse({
        email: "user@example.com",
      })
      expect(result.success).toBe(false)
    })

    test("should reject empty object", () => {
      const result = schema.safeParse({})
      expect(result.success).toBe(false)
    })
  })
})

describe("createSignupSchema", () => {
  const schema = createSignupSchema(mockT)

  describe("valid inputs", () => {
    test("should accept valid signup data", () => {
      const result = schema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
        agreeToTerms: true,
      })
      expect(result.success).toBe(true)
    })

    test("should accept name with exactly 2 characters", () => {
      const result = schema.safeParse({
        name: "Jo",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
        agreeToTerms: true,
      })
      expect(result.success).toBe(true)
    })

    test("should accept password with exactly 8 characters", () => {
      const result = schema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "12345678",
        confirmPassword: "12345678",
        agreeToTerms: true,
      })
      expect(result.success).toBe(true)
    })

    test("should accept agreeToTerms as false", () => {
      const result = schema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
        agreeToTerms: false,
      })
      expect(result.success).toBe(true)
    })
  })

  describe("invalid name", () => {
    test("should reject empty name", () => {
      const result = schema.safeParse({
        name: "",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
        agreeToTerms: true,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Name must be at least 2 characters")
      }
    })

    test("should reject single character name", () => {
      const result = schema.safeParse({
        name: "J",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
        agreeToTerms: true,
      })
      expect(result.success).toBe(false)
    })
  })

  describe("invalid email", () => {
    test("should reject invalid email", () => {
      const result = schema.safeParse({
        name: "John Doe",
        email: "not-an-email",
        password: "password123",
        confirmPassword: "password123",
        agreeToTerms: true,
      })
      expect(result.success).toBe(false)
    })
  })

  describe("invalid password", () => {
    test("should reject password with less than 8 characters", () => {
      const result = schema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "short",
        confirmPassword: "short",
        agreeToTerms: true,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password must be at least 8 characters")
      }
    })

    test("should reject empty password", () => {
      const result = schema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "",
        confirmPassword: "",
        agreeToTerms: true,
      })
      expect(result.success).toBe(false)
    })

    test("should reject password with 7 characters", () => {
      const result = schema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "1234567",
        confirmPassword: "1234567",
        agreeToTerms: true,
      })
      expect(result.success).toBe(false)
    })
  })

  describe("invalid confirmPassword", () => {
    test("should reject empty confirmPassword", () => {
      const result = schema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "",
        agreeToTerms: true,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Please confirm your password")
      }
    })
  })

  describe("missing fields", () => {
    test("should reject missing name", () => {
      const result = schema.safeParse({
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
        agreeToTerms: true,
      })
      expect(result.success).toBe(false)
    })

    test("should reject missing agreeToTerms", () => {
      const result = schema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
      })
      expect(result.success).toBe(false)
    })
  })
})

describe("createResetPasswordSchema", () => {
  const schema = createResetPasswordSchema(mockT)

  describe("valid inputs", () => {
    test("should accept valid email", () => {
      const result = schema.safeParse({
        email: "user@example.com",
      })
      expect(result.success).toBe(true)
    })

    test("should accept email with different formats", () => {
      const emails = [
        "test@test.com",
        "user.name@domain.co.uk",
        "user+label@example.org",
      ]

      for (const email of emails) {
        const result = schema.safeParse({ email })
        expect(result.success).toBe(true)
      }
    })
  })

  describe("invalid inputs", () => {
    test("should reject invalid email", () => {
      const result = schema.safeParse({
        email: "not-an-email",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid email address")
      }
    })

    test("should reject empty email", () => {
      const result = schema.safeParse({
        email: "",
      })
      expect(result.success).toBe(false)
    })

    test("should reject email without @", () => {
      const result = schema.safeParse({
        email: "userexample.com",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("missing fields", () => {
    test("should reject empty object", () => {
      const result = schema.safeParse({})
      expect(result.success).toBe(false)
    })
  })
})

describe("schema with different translation functions", () => {
  test("should use custom translation function", () => {
    const customT: TranslationFn = (key) => `CUSTOM:${key}`
    const schema = createLoginSchema(customT)

    const result = schema.safeParse({
      email: "invalid",
      password: "password",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("CUSTOM:emailInvalid")
    }
  })

  test("should handle translation function returning empty string", () => {
    const emptyT: TranslationFn = () => ""
    const schema = createLoginSchema(emptyT)

    const result = schema.safeParse({
      email: "",
      password: "password",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("")
    }
  })
})
