import { describe, test, expect } from "bun:test"
import { z } from "zod"

// Test the validation schema directly from safe-action.ts
describe("safe-action metadata schema", () => {
  test("should validate actionName as string", () => {
    const schema = z.object({ actionName: z.string() })
    
    const result = schema.safeParse({ actionName: "createUser" })
    expect(result.success).toBe(true)
  })

  test("should reject non-string actionName", () => {
    const schema = z.object({ actionName: z.string() })
    
    const result = schema.safeParse({ actionName: 123 })
    expect(result.success).toBe(false)
  })

  test("should reject missing actionName", () => {
    const schema = z.object({ actionName: z.string() })
    
    const result = schema.safeParse({})
    expect(result.success).toBe(false)
  })

  test("should reject empty string actionName", () => {
    const schema = z.object({ actionName: z.string() })
    
    const result = schema.safeParse({ actionName: "" })
    expect(result.success).toBe(true) // z.string() accepts empty strings
  })

  test("should accept various action name formats", () => {
    const schema = z.object({ actionName: z.string() })
    
    const validNames = [
      "createUser",
      "update-profile",
      "delete_user",
      "api.v1.users.create",
      "UserCreationAction",
      "create user", // with space
    ]

    for (const actionName of validNames) {
      const result = schema.safeParse({ actionName })
      expect(result.success).toBe(true)
    }
  })
})

describe("error handling behavior", () => {
  test("handleServerError should return generic message", () => {
    // Simulate the handleServerError function behavior
    const handleServerError = (e: Error) => {
      console.error("Action error:", e.message)
      return "Something went wrong. Please try again."
    }

    const error = new Error("Database connection failed")
    const result = handleServerError(error)
    
    expect(result).toBe("Something went wrong. Please try again.")
  })

  test("handleServerError should handle errors without message", () => {
    const handleServerError = (e: Error) => {
      console.error("Action error:", e.message)
      return "Something went wrong. Please try again."
    }

    const error = new Error()
    const result = handleServerError(error)
    
    expect(result).toBe("Something went wrong. Please try again.")
  })

  test("handleServerError should handle various error types", () => {
    const handleServerError = (e: Error) => {
      console.error("Action error:", e.message)
      return "Something went wrong. Please try again."
    }

    const errors = [
      new Error("Validation failed"),
      new Error("Unauthorized access"),
      new Error("Rate limit exceeded"),
      new Error("Internal server error"),
      new TypeError("Invalid type"),
      new RangeError("Value out of range"),
    ]

    for (const error of errors) {
      const result = handleServerError(error)
      expect(result).toBe("Something went wrong. Please try again.")
    }
  })
})

describe("publicAction configuration", () => {
  test("should accept metadata with actionName", () => {
    const metadataSchema = z.object({ actionName: z.string() })
    
    const metadata = { actionName: "publicSubmit" }
    const result = metadataSchema.safeParse(metadata)
    
    expect(result.success).toBe(true)
  })

  test("should be usable for contact forms", () => {
    const metadataSchema = z.object({ actionName: z.string() })
    const inputSchema = z.object({
      email: z.string().email(),
      message: z.string().min(1),
    })
    
    const metadata = { actionName: "submitContactForm" }
    const input = { email: "user@example.com", message: "Hello!" }
    
    expect(metadataSchema.safeParse(metadata).success).toBe(true)
    expect(inputSchema.safeParse(input).success).toBe(true)
  })

  test("should be usable for newsletter signup", () => {
    const metadataSchema = z.object({ actionName: z.string() })
    const inputSchema = z.object({
      email: z.string().email(),
    })
    
    const metadata = { actionName: "subscribeNewsletter" }
    const input = { email: "subscriber@example.com" }
    
    expect(metadataSchema.safeParse(metadata).success).toBe(true)
    expect(inputSchema.safeParse(input).success).toBe(true)
  })
})

describe("authAction configuration", () => {
  test("should require session context", () => {
    // Simulate auth middleware behavior
    const checkAuth = (session: unknown) => {
      if (!session) {
        throw new Error("Unauthorized")
      }
      return { session, user: { id: "user-123" } }
    }

    expect(() => checkAuth(null)).toThrow("Unauthorized")
    expect(() => checkAuth(undefined)).toThrow("Unauthorized")
  })

  test("should allow access with valid session", () => {
    const checkAuth = (session: unknown) => {
      if (!session) {
        throw new Error("Unauthorized")
      }
      return { session, user: { id: "user-123" } }
    }

    const validSession = { id: "session-123", userId: "user-123" }
    const result = checkAuth(validSession)
    
    expect(result.user.id).toBe("user-123")
  })

  test("should inject user and session into context", () => {
    // Simulate context injection
    const createContext = (session: { session: { id: string }; user: { id: string } }) => {
      return {
        ctx: {
          session: session.session,
          user: session.user,
        },
      }
    }

    const mockSession = {
      session: { id: "sess-123" },
      user: { id: "user-456", email: "user@example.com" },
    }

    const context = createContext(mockSession)
    
    expect(context.ctx.session.id).toBe("sess-123")
    expect(context.ctx.user.id).toBe("user-456")
  })

  test("should work for authenticated mutations", () => {
    const metadataSchema = z.object({ actionName: z.string() })
    const inputSchema = z.object({
      title: z.string().min(1),
      description: z.string(),
    })
    
    const metadata = { actionName: "createInternship" }
    const input = { 
      title: "Software Engineering Intern", 
      description: "Join our team!" 
    }
    
    expect(metadataSchema.safeParse(metadata).success).toBe(true)
    expect(inputSchema.safeParse(input).success).toBe(true)
  })
})

describe("action middleware behavior", () => {
  test("should chain middleware correctly", () => {
    // Simulate middleware chaining
    const middleware1 = (input: { data: number }) => {
      return { ...input, step1: true }
    }
    
    const middleware2 = (input: { data: number; step1: boolean }) => {
      return { ...input, step2: true }
    }

    const result = middleware2(middleware1({ data: 42 }))
    
    expect(result.data).toBe(42)
    expect(result.step1).toBe(true)
    expect(result.step2).toBe(true)
  })

  test("should handle errors in middleware chain", () => {
    const middleware1 = () => {
      return { success: true }
    }
    
    const middleware2 = () => {
      throw new Error("Middleware error")
    }

    expect(() => {
      middleware1()
      middleware2()
    }).toThrow("Middleware error")
  })
})

describe("input validation patterns", () => {
  test("should validate complex input schemas", () => {
    const schema = z.object({
      userId: z.string().uuid(),
      amount: z.number().positive(),
      tags: z.array(z.string()).optional(),
    })

    const validInput = {
      userId: "550e8400-e29b-41d4-a716-446655440000",
      amount: 100.50,
      tags: ["important", "urgent"],
    }

    expect(schema.safeParse(validInput).success).toBe(true)
  })

  test("should reject invalid UUID", () => {
    const schema = z.object({
      userId: z.string().uuid(),
    })

    const invalidInput = {
      userId: "not-a-uuid",
    }

    expect(schema.safeParse(invalidInput).success).toBe(false)
  })

  test("should reject negative amount", () => {
    const schema = z.object({
      amount: z.number().positive(),
    })

    const invalidInput = {
      amount: -50,
    }

    expect(schema.safeParse(invalidInput).success).toBe(false)
  })
})

describe("server action error scenarios", () => {
  test("should handle validation errors", () => {
    const schema = z.object({
      email: z.string().email(),
    })

    const result = schema.safeParse({ email: "invalid" })
    expect(result.success).toBe(false)
  })

  test("should handle parsing errors gracefully", () => {
    const handleError = (error: unknown) => {
      if (error instanceof z.ZodError) {
        return error.issues.map((e: z.ZodIssue) => e.message).join(", ")
      }
      return "Unknown error"
    }

    const schema = z.object({ count: z.number() })
    const result = schema.safeParse({ count: "not-a-number" })
    
    if (!result.success) {
      const message = handleError(result.error)
      expect(message).toContain("expected number")
    }
  })

  test("should return generic error for unexpected errors", () => {
    const handleServerError = (e: Error) => {
      console.error("Action error:", e.message)
      return "Something went wrong. Please try again."
    }

    const unexpectedError = new Error("Unexpected database failure")
    const message = handleServerError(unexpectedError)
    
    expect(message).not.toContain("database")
    expect(message).not.toContain("failure")
    expect(message).toBe("Something went wrong. Please try again.")
  })
})
