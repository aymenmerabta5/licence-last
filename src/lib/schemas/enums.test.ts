import { describe, expect, test } from "bun:test"

import {
  applicationStatusSchema,
  companyReportSeveritySchema,
  companyReportStatusSchema,
  companyStatusSchema,
  internshipTypeSchema,
  isInternshipType,
  isWorkMode,
  offerStatusSchema,
  pipelineStageSchema,
  primaryUserRoleSchema,
  proficiencyLevelSchema,
  universityStatusSchema,
  userRoleSchema,
  workModeSchema,
} from "@/lib/schemas/enums"

describe("internshipTypeSchema", () => {
  test("should accept valid values", () => {
    for (const v of ["pfe", "immersion", "summer", "practical"]) {
      expect(internshipTypeSchema.safeParse(v).success).toBe(true)
    }
  })

  test("should reject invalid value", () => {
    expect(internshipTypeSchema.safeParse("internship").success).toBe(false)
  })
})

describe("workModeSchema", () => {
  test("should accept valid values", () => {
    for (const v of ["on_site", "hybrid", "remote"]) {
      expect(workModeSchema.safeParse(v).success).toBe(true)
    }
  })

  test("should reject invalid value", () => {
    expect(workModeSchema.safeParse("office").success).toBe(false)
  })
})

describe("applicationStatusSchema", () => {
  test("should accept all valid statuses", () => {
    const valid = [
      "applied",
      "company_accepted",
      "company_refused",
      "admin_validated",
      "admin_rejected",
      "withdrawn",
    ]
    for (const v of valid) {
      expect(applicationStatusSchema.safeParse(v).success).toBe(true)
    }
  })

  test("should reject invalid status", () => {
    expect(applicationStatusSchema.safeParse("pending").success).toBe(false)
  })
})

describe("pipelineStageSchema", () => {
  test("should accept all valid stages", () => {
    const valid = [
      "applied",
      "screening",
      "interview",
      "offer",
      "accepted",
      "rejected",
    ]
    for (const v of valid) {
      expect(pipelineStageSchema.safeParse(v).success).toBe(true)
    }
  })
})

describe("userRoleSchema", () => {
  test("should accept all valid roles", () => {
    const valid = [
      "student",
      "company_admin",
      "dept_head",
      "university_admin",
      "super_admin",
    ]
    for (const v of valid) {
      expect(userRoleSchema.safeParse(v).success).toBe(true)
    }
  })

  test("should reject admin (old name)", () => {
    expect(userRoleSchema.safeParse("admin").success).toBe(false)
  })
})

describe("primaryUserRoleSchema", () => {
  test("should accept only active auth roles", () => {
    const valid = [
      "student",
      "company_admin",
      "university_admin",
      "super_admin",
    ]
    for (const v of valid) {
      expect(primaryUserRoleSchema.safeParse(v).success).toBe(true)
    }
  })

  test("should reject dept_head as a raw auth role", () => {
    expect(primaryUserRoleSchema.safeParse("dept_head").success).toBe(false)
  })
})

describe("companyStatusSchema", () => {
  test("should accept valid statuses", () => {
    for (const v of ["pending", "approved", "rejected", "suspended"]) {
      expect(companyStatusSchema.safeParse(v).success).toBe(true)
    }
  })
})

describe("companyReportStatusSchema", () => {
  test("should accept valid report statuses", () => {
    for (const v of ["open", "reviewing", "resolved", "dismissed"]) {
      expect(companyReportStatusSchema.safeParse(v).success).toBe(true)
    }
  })
})

describe("companyReportSeveritySchema", () => {
  test("should accept valid severity levels", () => {
    for (const v of ["low", "medium", "high", "critical"]) {
      expect(companyReportSeveritySchema.safeParse(v).success).toBe(true)
    }
  })
})

describe("offerStatusSchema", () => {
  test("should accept valid offer statuses", () => {
    for (const v of ["draft", "published", "closed"]) {
      expect(offerStatusSchema.safeParse(v).success).toBe(true)
    }
  })
})

describe("proficiencyLevelSchema", () => {
  test("should accept all CEFR levels and native", () => {
    for (const v of ["a1", "a2", "b1", "b2", "c1", "c2", "native"]) {
      expect(proficiencyLevelSchema.safeParse(v).success).toBe(true)
    }
  })

  test("should reject uppercase CEFR levels", () => {
    expect(proficiencyLevelSchema.safeParse("A1").success).toBe(false)
  })
})

describe("universityStatusSchema", () => {
  test("should accept valid university statuses", () => {
    for (const v of ["pending", "approved", "rejected"]) {
      expect(universityStatusSchema.safeParse(v).success).toBe(true)
    }
  })
})

describe("isInternshipType", () => {
  test("should return true for valid internship type", () => {
    expect(isInternshipType("pfe")).toBe(true)
    expect(isInternshipType("summer")).toBe(true)
  })

  test("should return false for invalid value", () => {
    expect(isInternshipType("fulltime")).toBe(false)
    expect(isInternshipType("")).toBe(false)
  })
})

describe("isWorkMode", () => {
  test("should return true for valid work mode", () => {
    expect(isWorkMode("remote")).toBe(true)
    expect(isWorkMode("hybrid")).toBe(true)
  })

  test("should return false for invalid value", () => {
    expect(isWorkMode("office")).toBe(false)
    expect(isWorkMode("")).toBe(false)
  })
})
