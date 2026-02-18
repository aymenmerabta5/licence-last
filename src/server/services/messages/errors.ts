import "server-only"

import { ServiceError } from "@/server/services/errors"

export type MessageServiceErrorCode =
  | "OFFER_NOT_FOUND"
  | "OFFER_FORBIDDEN"
  | "APPLICATION_NOT_FOUND"
  | "THREAD_NOT_FOUND"
  | "THREAD_FORBIDDEN"
  | "MESSAGE_EMPTY"

export class MessageServiceError extends ServiceError<MessageServiceErrorCode> {
  constructor(code: MessageServiceErrorCode, message: string) {
    super(code, message)
    this.name = "MessageServiceError"
  }
}

export function isMessageServiceError(
  error: unknown,
): error is MessageServiceError {
  return error instanceof MessageServiceError
}
