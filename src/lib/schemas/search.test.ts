import { describe, expect, test } from "bun:test"

import {
  applyToOfferSchema,
  listStudentApplicationsSchema,
  searchCompaniesForStudentsSchema,
  searchOffersSchema,
} from "@/lib/schemas/search"

describe("src/lib/schemas/search", () => {
  describe("searchOffersSchema", () => {
    test("should accept empty params (all optional)", () => {
      const result = searchOffersSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(12)
      }
    })

    test("should accept full params", () => {
      const result = searchOffersSchema.safeParse({
        keyword: "frontend",
        wilayaCode: 16,
        internshipTypes: ["pfe", "summer"],
        workModes: ["remote", "hybrid"],
        skillTagIds: ["skill-1", "skill-2"],
        cursor: {
          createdAt: "2025-01-01T00:00:00.000Z",
          id: "abc-123",
        },
        limit: 20,
      })
      expect(result.success).toBe(true)
    })

    test("should reject keyword longer than 200 chars", () => {
      const result = searchOffersSchema.safeParse({
        keyword: "a".repeat(201),
      })
      expect(result.success).toBe(false)
    })

    test("should reject invalid wilayaCode", () => {
      expect(searchOffersSchema.safeParse({ wilayaCode: 0 }).success).toBe(
        false,
      )
      expect(searchOffersSchema.safeParse({ wilayaCode: 59 }).success).toBe(
        false,
      )
    })

    test("should accept wilayaCode boundaries (1 and 58)", () => {
      expect(searchOffersSchema.safeParse({ wilayaCode: 1 }).success).toBe(true)
      expect(searchOffersSchema.safeParse({ wilayaCode: 58 }).success).toBe(
        true,
      )
    })

    test("should reject invalid internship types", () => {
      const result = searchOffersSchema.safeParse({
        internshipTypes: ["invalid"],
      })
      expect(result.success).toBe(false)
    })

    test("should reject invalid work modes", () => {
      const result = searchOffersSchema.safeParse({
        workModes: ["invalid"],
      })
      expect(result.success).toBe(false)
    })

    test("should reject limit above 50", () => {
      const result = searchOffersSchema.safeParse({ limit: 51 })
      expect(result.success).toBe(false)
    })

    test("should reject more than 20 skill tag IDs", () => {
      const result = searchOffersSchema.safeParse({
        skillTagIds: Array.from({ length: 21 }, (_, i) => `skill-${i}`),
      })
      expect(result.success).toBe(false)
    })

    test("should coerce limit from string", () => {
      const result = searchOffersSchema.safeParse({ limit: "5" })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(5)
      }
    })
  })

  describe("applyToOfferSchema", () => {
    test("should accept valid application with cover letter", () => {
      const result = applyToOfferSchema.safeParse({
        offerId: "offer-123",
        coverLetter: "I am very interested in this position...",
      })
      expect(result.success).toBe(true)
    })

    test("should accept application without cover letter", () => {
      const result = applyToOfferSchema.safeParse({
        offerId: "offer-123",
      })
      expect(result.success).toBe(true)
    })

    test("should reject empty offerId", () => {
      const result = applyToOfferSchema.safeParse({
        offerId: "",
      })
      expect(result.success).toBe(false)
    })

    test("should reject cover letter exceeding 5000 chars", () => {
      const result = applyToOfferSchema.safeParse({
        offerId: "offer-123",
        coverLetter: "a".repeat(5001),
      })
      expect(result.success).toBe(false)
    })

    test("should reject missing offerId", () => {
      const result = applyToOfferSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe("searchCompaniesForStudentsSchema", () => {
    test("should accept empty params (all optional)", () => {
      const result = searchCompaniesForStudentsSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(12)
      }
    })

    test("should accept full params", () => {
      const result = searchCompaniesForStudentsSchema.safeParse({
        keyword: "acme",
        wilayaCode: 16,
        cursor: {
          createdAt: "2025-01-01T00:00:00.000Z",
          id: "company-1",
        },
        limit: 20,
      })
      expect(result.success).toBe(true)
    })

    test("should reject keyword longer than 200 chars", () => {
      const result = searchCompaniesForStudentsSchema.safeParse({
        keyword: "a".repeat(201),
      })
      expect(result.success).toBe(false)
    })

    test("should reject invalid wilayaCode", () => {
      expect(
        searchCompaniesForStudentsSchema.safeParse({ wilayaCode: 0 }).success,
      ).toBe(false)
      expect(
        searchCompaniesForStudentsSchema.safeParse({ wilayaCode: 59 }).success,
      ).toBe(false)
    })

    test("should reject limit above 50", () => {
      const result = searchCompaniesForStudentsSchema.safeParse({ limit: 51 })
      expect(result.success).toBe(false)
    })
  })

  describe("listStudentApplicationsSchema", () => {
    test("should accept empty params (all optional)", () => {
      const result = listStudentApplicationsSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(12)
      }
    })

    test("should accept all valid statuses", () => {
      for (const status of [
        "applied",
        "company_accepted",
        "company_refused",
        "admin_validated",
        "admin_rejected",
        "withdrawn",
      ]) {
        const result = listStudentApplicationsSchema.safeParse({ status })
        expect(result.success).toBe(true)
      }
    })

    test("should reject invalid status", () => {
      const result = listStudentApplicationsSchema.safeParse({
        status: "invalid",
      })
      expect(result.success).toBe(false)
    })

    test("should accept with cursor", () => {
      const result = listStudentApplicationsSchema.safeParse({
        cursor: {
          createdAt: "2025-06-01T12:00:00.000Z",
          id: "app-abc",
        },
        limit: 10,
      })
      expect(result.success).toBe(true)
    })
  })
})
