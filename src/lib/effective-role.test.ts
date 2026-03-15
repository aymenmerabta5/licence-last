import { describe, expect, test } from "bun:test"

import {
  deriveEffectiveUserRole,
  isDepartmentHeadMembershipRole,
} from "@/lib/effective-role"

describe("src/lib/effective-role", () => {
  test("should derive dept_head when university admin has department_head membership", () => {
    expect(
      deriveEffectiveUserRole({
        userRole: "university_admin",
        universityMembershipRole: "department_head",
      }),
    ).toBe("dept_head")
  })

  test("should keep university_admin when no department_head membership exists", () => {
    expect(
      deriveEffectiveUserRole({
        userRole: "university_admin",
        universityMembershipRole: null,
      }),
    ).toBe("university_admin")
  })

  test("should keep company_admin unchanged", () => {
    expect(
      deriveEffectiveUserRole({
        userRole: "company_admin",
        universityMembershipRole: "department_head",
      }),
    ).toBe("company_admin")
  })

  test("should preserve legacy dept_head rows as dept_head", () => {
    expect(
      deriveEffectiveUserRole({
        userRole: "dept_head",
        universityMembershipRole: null,
      }),
    ).toBe("dept_head")
  })

  test("should identify department_head membership role", () => {
    expect(isDepartmentHeadMembershipRole("department_head")).toBe(true)
    expect(isDepartmentHeadMembershipRole(null)).toBe(false)
    expect(isDepartmentHeadMembershipRole("owner")).toBe(false)
  })
})
