import { describe, expect, test } from "bun:test"

import {
  hasUniversityScopedAccess,
  isAdminRole,
} from "@/server/orpc/authz"

describe("src/server/orpc/middleware authz helpers", () => {
  test("isAdminRole excludes department heads from full admin access", () => {
    expect(isAdminRole("university_admin")).toBe(true)
    expect(isAdminRole("university_admin", "department_head")).toBe(false)
    expect(isAdminRole("super_admin", "department_head")).toBe(true)
  })

  test("hasUniversityScopedAccess still allows department-head scope", () => {
    expect(
      hasUniversityScopedAccess({
        role: "university_admin",
        universityMembershipRole: "department_head",
      }),
    ).toBe(true)
    expect(
      hasUniversityScopedAccess({
        role: "student",
        universityMembershipRole: "department_head",
      }),
    ).toBe(true)
    expect(
      hasUniversityScopedAccess({
        role: "company_admin",
        universityMembershipRole: null,
      }),
    ).toBe(false)
  })
})
