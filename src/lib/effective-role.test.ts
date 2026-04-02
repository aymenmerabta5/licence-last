import { describe, expect, test } from "bun:test"

import { getEffectiveRole, isDepartmentHead } from "@/lib/effective-role"

describe("src/lib/effective-role", () => {
  test("should return university_admin for university_admin role", () => {
    expect(getEffectiveRole({ role: "university_admin" })).toBe(
      "university_admin",
    )
  })

  test("should map legacy dept_head to university_admin", () => {
    expect(getEffectiveRole({ role: "dept_head" })).toBe("university_admin")
  })

  test("should return primary roles unchanged", () => {
    expect(getEffectiveRole({ role: "student" })).toBe("student")
    expect(getEffectiveRole({ role: "company_admin" })).toBe("company_admin")
    expect(getEffectiveRole({ role: "super_admin" })).toBe("super_admin")
  })

  test("should default to student for unknown roles", () => {
    expect(getEffectiveRole({ role: null })).toBe("student")
    expect(getEffectiveRole({ role: undefined })).toBe("student")
    expect(getEffectiveRole({ role: "unknown" })).toBe("student")
  })

  test("should identify department_head membership role", () => {
    expect(isDepartmentHead("department_head")).toBe(true)
    expect(isDepartmentHead(null)).toBe(false)
    expect(isDepartmentHead("owner")).toBe(false)
  })
})
