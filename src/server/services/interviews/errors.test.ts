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

describe("src/server/services/interviews/errors", () => {
  beforeEach(() => {
    applyMocks()
  })

  test("should create InterviewServiceError with correct code and message", async () => {
    const { InterviewServiceError, isInterviewServiceError } = await import(
      `@/server/services/interviews/errors?fresh=${Date.now()}`
    )

    const error = new InterviewServiceError(
      "INTERVIEW_NOT_FOUND",
      "Interview not found",
    )

    expect(error.name).toBe("InterviewServiceError")
    expect(error.code).toBe("INTERVIEW_NOT_FOUND")
    expect(error.message).toBe("Interview not found")
    expect(isInterviewServiceError(error)).toBe(true)
  })

  test("should identify InterviewServiceError via type guard", async () => {
    const { isInterviewServiceError } = await import(
      `@/server/services/interviews/errors?fresh=${Date.now()}`
    )

    expect(isInterviewServiceError(new Error("plain"))).toBe(false)
    expect(isInterviewServiceError(null)).toBe(false)
    expect(isInterviewServiceError(undefined)).toBe(false)
  })

  test("should support all expected error codes", async () => {
    const { InterviewServiceError } = await import(
      `@/server/services/interviews/errors?fresh=${Date.now()}`
    )

    const codes = [
      "APPLICATION_NOT_FOUND",
      "APPLICATION_FORBIDDEN",
      "INTERVIEW_ALREADY_EXISTS",
      "INTERVIEW_NOT_FOUND",
      "INTERVIEW_FORBIDDEN",
      "INTERVIEW_ALREADY_CONFIRMED",
      "INTERVIEW_SLOT_NOT_FOUND",
      "INTERVIEW_SLOT_INVALID",
      "INTERVIEW_INVALID_APPLICATION_STATE",
    ] as const

    for (const code of codes) {
      const error = new InterviewServiceError(code, "test")
      expect(error.code).toBe(code)
    }
  })
})
