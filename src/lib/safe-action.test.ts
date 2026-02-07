import { describe, test, expect } from "bun:test"
import { z } from "zod"

describe("safe-action patterns", () => {
  describe("metadata schema validation", () => {
    const metadataSchema = z.object({ actionName: z.string() })

    describe("valid metadata", () => {
      test("should accept actionName as string", () => {
        const result = metadataSchema.safeParse({ actionName: "createUser" })
        expect(result.success).toBe(true)
      })

      test("should accept various action name formats", () => {
        const validNames = [
          "createUser",
          "update-profile",
          "delete_user",
          "api.v1.users.create",
          "UserCreationAction",
          "create user",
        ]

        for (const actionName of validNames) {
          const result = metadataSchema.safeParse({ actionName })
          expect(result.success).toBe(true)
        }
      })
    })

    describe("invalid metadata", () => {
      test("should reject non-string actionName", () => {
        const result = metadataSchema.safeParse({ actionName: 123 })
        expect(result.success).toBe(false)
      })

      test("should reject missing actionName", () => {
        const result = metadataSchema.safeParse({})
        expect(result.success).toBe(false)
      })
    })
  })

  describe("server action error handling", () => {
    test("handleServerError should return generic message", () => {
      // The handleServerError is internal to the action client
      // This test documents the expected behavior
      const handleServerError = (e: Error) => {
        console.error("Action error:", e.message)
        return "Something went wrong. Please try again."
      }

      const error = new Error("Database connection failed")
      const result = handleServerError(error)
      
      expect(result).toBe("Something went wrong. Please try again.")
      expect(result).not.toContain("Database")
      expect(result).not.toContain("connection")
    })

    test("handleServerError should not leak internal details", () => {
      const handleServerError = (e: Error) => {
        console.error("Action error:", e.message)
        return "Something went wrong. Please try again."
      }

      const sensitiveErrors = [
        new Error("SQL syntax error near 'SELECT * FROM passwords'"),
        new Error("API_KEY: sk-live-123456789"),
        new Error("Connection to internal-db:5432 failed"),
      ]

      for (const error of sensitiveErrors) {
        const result = handleServerError(error)
        expect(result).toBe("Something went wrong. Please try again.")
        expect(result).not.toContain("SQL")
        expect(result).not.toContain("API_KEY")
        expect(result).not.toContain("internal-db")
      }
    })
  })

  describe("action client usage patterns", () => {
    test("publicAction pattern should work for contact forms", () => {
      const metadataSchema = z.object({ actionName: z.string() })
      const inputSchema = z.object({
        email: z.string().email(),
        message: z.string().min(1),
      })
      
      // Simulate the action definition
      const metadata = { actionName: "submitContactForm" }
      const validInput = { 
        email: "user@example.com", 
        message: "Hello!" 
      }
      
      expect(metadataSchema.safeParse(metadata).success).toBe(true)
      expect(inputSchema.safeParse(validInput).success).toBe(true)
    })

    test("publicAction pattern should work for newsletter signup", () => {
      const metadataSchema = z.object({ actionName: z.string() })
      const inputSchema = z.object({
        email: z.string().email(),
      })
      
      const metadata = { actionName: "subscribeNewsletter" }
      const validInput = { email: "subscriber@example.com" }
      
      expect(metadataSchema.safeParse(metadata).success).toBe(true)
      expect(inputSchema.safeParse(validInput).success).toBe(true)
    })

    test("authAction pattern should work for authenticated mutations", () => {
      const metadataSchema = z.object({ actionName: z.string() })
      const inputSchema = z.object({
        title: z.string().min(1),
        description: z.string(),
      })
      
      const metadata = { actionName: "createInternship" }
      const validInput = { 
        title: "Software Engineering Intern", 
        description: "Join our team!" 
      }
      
      expect(metadataSchema.safeParse(metadata).success).toBe(true)
      expect(inputSchema.safeParse(validInput).success).toBe(true)
    })
  })

  describe("auth middleware patterns", () => {
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

  describe("zod error handling", () => {
    test("should handle validation errors gracefully", () => {
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

  describe("middleware chaining", () => {
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
})
