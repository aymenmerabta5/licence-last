import { describe, test, expect } from "bun:test"
import { ORPCError } from "@orpc/server"
import { ApplicationServiceError, isApplicationServiceError } from "@/server/services/applications/errors"
import {
  getApplyToOfferStatus,
  getListByOfferStatus,
  getWithdrawStatus,
  getCompanyActionStatus,
  createApplicationORPCError,
} from "@/server/orpc/routes/applications.error-mapping"

describe("ApplicationServiceError to ORPCError mapping", () => {
  describe("applyToOffer status mapping", () => {
    test("OFFER_NOT_FOUND maps to NOT_FOUND", () => {
      const error = new ApplicationServiceError("OFFER_NOT_FOUND", "Offer not found")
      expect(isApplicationServiceError(error)).toBe(true)
      // Tests the ACTUAL route mapping logic from applications.ts
      expect(getApplyToOfferStatus(error.code)).toBe("NOT_FOUND")
    })

    test("OFFER_NOT_OPEN maps to BAD_REQUEST", () => {
      const error = new ApplicationServiceError("OFFER_NOT_OPEN", "Not open")
      expect(getApplyToOfferStatus(error.code)).toBe("BAD_REQUEST")
    })

    test("OFFER_DEADLINE_PASSED maps to BAD_REQUEST", () => {
      const error = new ApplicationServiceError("OFFER_DEADLINE_PASSED", "Deadline passed")
      expect(getApplyToOfferStatus(error.code)).toBe("BAD_REQUEST")
    })

    test("OFFER_FULL maps to CONFLICT", () => {
      const error = new ApplicationServiceError("OFFER_FULL", "Full")
      expect(getApplyToOfferStatus(error.code)).toBe("CONFLICT")
    })

    test("ALREADY_APPLIED maps to CONFLICT", () => {
      const error = new ApplicationServiceError("ALREADY_APPLIED", "Already applied")
      expect(getApplyToOfferStatus(error.code)).toBe("CONFLICT")
    })

    test("Unknown code falls back to BAD_REQUEST", () => {
      // @ts-expect-error Testing unknown error code fallback
      const error = new ApplicationServiceError("UNKNOWN_CODE", "Unknown")
      expect(getApplyToOfferStatus(error.code)).toBe("BAD_REQUEST")
    })
  })

  describe("withdrawApplication status mapping", () => {
    test("APPLICATION_NOT_FOUND maps to NOT_FOUND", () => {
      const error = new ApplicationServiceError("APPLICATION_NOT_FOUND", "Not found")
      // Tests the ACTUAL route mapping logic from applications.ts
      expect(getWithdrawStatus(error.code)).toBe("NOT_FOUND")
    })

    test("APPLICATION_INVALID_STATE maps to BAD_REQUEST", () => {
      const error = new ApplicationServiceError("APPLICATION_INVALID_STATE", "Invalid state")
      expect(getWithdrawStatus(error.code)).toBe("BAD_REQUEST")
    })

    test("Unknown code falls back to BAD_REQUEST", () => {
      // @ts-expect-error Testing unknown error code fallback
      const error = new ApplicationServiceError("UNKNOWN_CODE", "Unknown")
      expect(getWithdrawStatus(error.code)).toBe("BAD_REQUEST")
    })
  })

  describe("listByOffer status mapping", () => {
    test("OFFER_NOT_FOUND maps to NOT_FOUND", () => {
      const error = new ApplicationServiceError("OFFER_NOT_FOUND", "Offer not found")
      expect(getListByOfferStatus(error.code)).toBe("NOT_FOUND")
    })

    test("OFFER_FORBIDDEN maps to FORBIDDEN", () => {
      const error = new ApplicationServiceError("OFFER_FORBIDDEN", "Forbidden")
      expect(getListByOfferStatus(error.code)).toBe("FORBIDDEN")
    })

    test("Unknown code falls back to BAD_REQUEST", () => {
      // @ts-expect-error Testing unknown error code fallback
      const error = new ApplicationServiceError("UNKNOWN_CODE", "Unknown")
      expect(getListByOfferStatus(error.code)).toBe("BAD_REQUEST")
    })
  })

  describe("companyAccept/Refuse status mapping", () => {
    test("APPLICATION_NOT_FOUND maps to NOT_FOUND", () => {
      const error = new ApplicationServiceError("APPLICATION_NOT_FOUND", "Not found")
      // Tests the ACTUAL route mapping logic from applications.ts
      expect(getCompanyActionStatus(error.code)).toBe("NOT_FOUND")
    })

    test("APPLICATION_FORBIDDEN maps to FORBIDDEN", () => {
      const error = new ApplicationServiceError("APPLICATION_FORBIDDEN", "No access")
      expect(getCompanyActionStatus(error.code)).toBe("FORBIDDEN")
    })

    test("APPLICATION_INVALID_STATE maps to BAD_REQUEST", () => {
      const error = new ApplicationServiceError("APPLICATION_INVALID_STATE", "Invalid")
      expect(getCompanyActionStatus(error.code)).toBe("BAD_REQUEST")
    })

    test("Unknown code falls back to BAD_REQUEST", () => {
      // @ts-expect-error Testing unknown error code fallback
      const error = new ApplicationServiceError("UNKNOWN_CODE", "Unknown")
      expect(getCompanyActionStatus(error.code)).toBe("BAD_REQUEST")
    })
  })

  describe("createApplicationORPCError", () => {
    test("creates ORPCError with correct status, message, and data.code", () => {
      const serviceError = new ApplicationServiceError("OFFER_NOT_FOUND", "Offer not found")
      // Tests the ACTUAL error creation logic from applications.ts
      const orpcError = createApplicationORPCError(serviceError, "NOT_FOUND")

      // ORPCError.status returns numeric HTTP status code
      expect(orpcError.status).toBe(404)
      expect(orpcError.message).toBe("Offer not found")
      expect(orpcError.data).toEqual({ code: "OFFER_NOT_FOUND" })
    })

    test("creates ORPCError with CONFLICT status for application conflicts", () => {
      const serviceError = new ApplicationServiceError("ALREADY_APPLIED", "Already applied")
      const orpcError = createApplicationORPCError(serviceError, "CONFLICT")

      expect(orpcError.status).toBe(409)
      expect(orpcError.message).toBe("Already applied")
      expect(orpcError.data).toEqual({ code: "ALREADY_APPLIED" })
    })
  })

  describe("isApplicationServiceError type guard", () => {
    test("returns true for ApplicationServiceError", () => {
      const error = new ApplicationServiceError("OFFER_NOT_FOUND", "Not found")
      expect(isApplicationServiceError(error)).toBe(true)
    })

    test("returns false for generic Error", () => {
      const error = new Error("Generic error")
      expect(isApplicationServiceError(error)).toBe(false)
    })

    test("returns false for ORPCError", () => {
      const error = new ORPCError("BAD_REQUEST", { message: "Bad request" })
      expect(isApplicationServiceError(error)).toBe(false)
    })

    test("returns false for non-error values", () => {
      expect(isApplicationServiceError(null)).toBe(false)
      expect(isApplicationServiceError(undefined)).toBe(false)
      expect(isApplicationServiceError("string")).toBe(false)
      expect(isApplicationServiceError(123)).toBe(false)
      expect(isApplicationServiceError({})).toBe(false)
    })
  })

  describe("End-to-end error mapping flow", () => {
    test("full applyToOffer error flow - OFFER_NOT_FOUND", () => {
      const serviceError = new ApplicationServiceError("OFFER_NOT_FOUND", "Offer not found")
      const statusCode = getApplyToOfferStatus(serviceError.code)
      const orpcError = createApplicationORPCError(serviceError, statusCode)

      expect(statusCode).toBe("NOT_FOUND")
      expect(orpcError.status).toBe(404)
      expect(orpcError.data).toEqual({ code: "OFFER_NOT_FOUND" })
    })

    test("full withdrawApplication error flow - APPLICATION_INVALID_STATE", () => {
      const serviceError = new ApplicationServiceError("APPLICATION_INVALID_STATE", "Invalid state")
      const statusCode = getWithdrawStatus(serviceError.code)
      const orpcError = createApplicationORPCError(serviceError, statusCode)

      expect(statusCode).toBe("BAD_REQUEST")
      expect(orpcError.status).toBe(400)
      expect(orpcError.data).toEqual({ code: "APPLICATION_INVALID_STATE" })
    })

    test("full company action error flow - APPLICATION_FORBIDDEN", () => {
      const serviceError = new ApplicationServiceError("APPLICATION_FORBIDDEN", "Access denied")
      const statusCode = getCompanyActionStatus(serviceError.code)
      const orpcError = createApplicationORPCError(serviceError, statusCode)

      expect(statusCode).toBe("FORBIDDEN")
      expect(orpcError.status).toBe(403)
      expect(orpcError.data).toEqual({ code: "APPLICATION_FORBIDDEN" })
    })
  })
})
