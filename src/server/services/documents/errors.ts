import "server-only"

import { ServiceError } from "@/server/services/errors"

export type DocumentServiceErrorCode =
  | "PLACEMENT_NOT_FOUND"
  | "PLACEMENT_FORBIDDEN"
  | "PLACEMENT_NOT_VALIDATED"
  | "INTERNSHIP_NOT_COMPLETED"
  | "APPLICATION_NOT_FOUND"
  | "DOCUMENT_NOT_FOUND"
  | "DOCUMENT_FORBIDDEN"
  | "DOCUMENT_NOT_READY"
  | "DOCUMENT_UNSUPPORTED_TYPE"
  | "DOCUMENT_GENERATION_FAILED"
  | "DOCUMENT_RECORD_NOT_FOUND"
  | "DOCUMENT_CONFLICT_RESOLUTION_FAILED"

export class DocumentServiceError extends ServiceError<DocumentServiceErrorCode> {
  constructor(code: DocumentServiceErrorCode, message: string) {
    super(code, message)
    this.name = "DocumentServiceError"
  }
}

export function isDocumentServiceError(
  error: unknown,
): error is DocumentServiceError {
  return error instanceof DocumentServiceError
}