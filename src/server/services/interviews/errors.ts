import "server-only"

import { ServiceError } from "@/server/services/errors"

export type InterviewServiceErrorCode =
  | "APPLICATION_NOT_FOUND"
  | "APPLICATION_FORBIDDEN"
  | "INTERVIEW_ALREADY_EXISTS"
  | "INTERVIEW_NOT_FOUND"
  | "INTERVIEW_FORBIDDEN"
  | "INTERVIEW_ALREADY_CONFIRMED"
  | "INTERVIEW_ALREADY_COMPLETED"
  | "INTERVIEW_INVALID_STATUS"
  | "INTERVIEW_SLOT_NOT_FOUND"
  | "INTERVIEW_SLOT_INVALID"
  | "INTERVIEW_INVALID_APPLICATION_STATE"

export class InterviewServiceError extends ServiceError<InterviewServiceErrorCode> {
  constructor(code: InterviewServiceErrorCode, message: string) {
    super(code, message)
    this.name = "InterviewServiceError"
  }
}

export function isInterviewServiceError(
  error: unknown,
): error is InterviewServiceError {
  return error instanceof InterviewServiceError
}
