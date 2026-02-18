import "server-only"

import { ServiceError } from "@/server/services/errors"

export type StudentCvServiceErrorCode =
  | "EXPERIENCE_NOT_FOUND"
  | "EXPERIENCE_FORBIDDEN"
  | "PROJECT_NOT_FOUND"
  | "PROJECT_FORBIDDEN"
  | "RESUME_NOT_FOUND"
  | "INVALID_DATE_RANGE"

export class StudentCvServiceError extends ServiceError<StudentCvServiceErrorCode> {
  constructor(code: StudentCvServiceErrorCode, message: string) {
    super(code, message)
    this.name = "StudentCvServiceError"
  }
}

export function isStudentCvServiceError(
  error: unknown,
): error is StudentCvServiceError {
  return error instanceof StudentCvServiceError
}
