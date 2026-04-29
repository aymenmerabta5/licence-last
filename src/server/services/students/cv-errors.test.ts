import { beforeEach, describe, expect, mock, test } from "bun:test"

function applyMocks() {
  mock.module("@/server/services/errors", () => ({
    ServiceError: class ServiceError<TCode extends string = string> extends Error {
      readonly code: TCode
      constructor(code: TCode, message: string) {
        super(message)
        this.name = "ServiceError"
        this.code = code
      }
    },
    isServiceError: (error: unknown): error is Error => error instanceof Error,
  }))
}

describe("src/server/services/students/cv-errors", () => {
  beforeEach(() => {
    applyMocks()
  })

  test("should create StudentCvServiceError with correct code and message", async () => {
    const { StudentCvServiceError, isStudentCvServiceError } = await import(
      `@/server/services/students/cv-errors?fresh=${Date.now()}`
    )

    const error = new StudentCvServiceError(
      "EXPERIENCE_NOT_FOUND",
      "Experience not found",
    )

    expect(error.name).toBe("StudentCvServiceError")
    expect(error.code).toBe("EXPERIENCE_NOT_FOUND")
    expect(error.message).toBe("Experience not found")
    expect(isStudentCvServiceError(error)).toBe(true)
  })

  test("should identify StudentCvServiceError via type guard", async () => {
    const { isStudentCvServiceError } = await import(
      `@/server/services/students/cv-errors?fresh=${Date.now()}`
    )

    expect(isStudentCvServiceError(new Error("plain"))).toBe(false)
    expect(isStudentCvServiceError(null)).toBe(false)
    expect(isStudentCvServiceError(undefined)).toBe(false)
  })

  test("should support all expected error codes", async () => {
    const { StudentCvServiceError } = await import(
      `@/server/services/students/cv-errors?fresh=${Date.now()}`
    )

    const codes = [
      "EXPERIENCE_NOT_FOUND",
      "EXPERIENCE_FORBIDDEN",
      "PROJECT_NOT_FOUND",
      "PROJECT_FORBIDDEN",
      "RESUME_NOT_FOUND",
      "INVALID_DATE_RANGE",
    ] as const

    for (const code of codes) {
      const error = new StudentCvServiceError(code, "test")
      expect(error.code).toBe(code)
    }
  })
})
