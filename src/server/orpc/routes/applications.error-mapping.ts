import "server-only"

import { ORPCError } from "@orpc/server"
import { ApplicationServiceError } from "@/server/services/applications/errors"

/**
 * Error mapping utilities for application procedures.
 *
 * These functions are extracted into a separate module to enable testing
 * without importing the full route handlers (which have database dependencies).
 */

export function getApplyToOfferStatus(code: string): string {
  const statusMap: Record<string, string> = {
    OFFER_NOT_FOUND: "NOT_FOUND",
    OFFER_NOT_OPEN: "BAD_REQUEST",
    OFFER_DEADLINE_PASSED: "BAD_REQUEST",
    OFFER_FULL: "CONFLICT",
    ALREADY_APPLIED: "CONFLICT",
  }
  return statusMap[code] ?? "BAD_REQUEST"
}

export function getListByOfferStatus(code: string): string {
  const statusMap: Record<string, string> = {
    OFFER_NOT_FOUND: "NOT_FOUND",
    OFFER_FORBIDDEN: "FORBIDDEN",
  }
  return statusMap[code] ?? "BAD_REQUEST"
}

export function getWithdrawStatus(code: string): string {
  const statusMap: Record<string, string> = {
    APPLICATION_NOT_FOUND: "NOT_FOUND",
    APPLICATION_INVALID_STATE: "BAD_REQUEST",
  }
  return statusMap[code] ?? "BAD_REQUEST"
}

export function getCompanyActionStatus(code: string): string {
  const statusMap: Record<string, string> = {
    APPLICATION_NOT_FOUND: "NOT_FOUND",
    APPLICATION_FORBIDDEN: "FORBIDDEN",
    APPLICATION_INVALID_STATE: "BAD_REQUEST",
  }
  return statusMap[code] ?? "BAD_REQUEST"
}

export function createApplicationORPCError(
  error: ApplicationServiceError,
  statusCode: string,
) {
  return new ORPCError(statusCode, {
    message: error.message,
    data: { code: error.code },
  })
}
