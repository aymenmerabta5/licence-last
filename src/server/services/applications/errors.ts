import "server-only"

import { ServiceError } from "@/server/services/errors"

export type ApplicationServiceErrorCode =
  | "OFFER_NOT_FOUND"
  | "OFFER_NOT_OPEN"
  | "OFFER_DEADLINE_PASSED"
  | "OFFER_FULL"
  | "ALREADY_APPLIED"
  | "APPLICATION_NOT_FOUND"
  | "APPLICATION_FORBIDDEN"
  | "APPLICATION_INVALID_STATE"

export class ApplicationServiceError extends ServiceError<ApplicationServiceErrorCode> {
  constructor(code: ApplicationServiceErrorCode, message: string) {
    super(code, message)
    this.name = "ApplicationServiceError"
  }
}

export function isApplicationServiceError(
  error: unknown,
): error is ApplicationServiceError {
  return error instanceof ApplicationServiceError
}
