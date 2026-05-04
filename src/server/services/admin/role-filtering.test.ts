import { describe, expect, test } from "bun:test"
import {
  isPrimaryCompanyAdminRole,
  isPrimaryUniversityAdminRole,
  resolveMembershipAwareRoleFilter,
} from "@/server/services/admin/role-filtering"

describe("resolveMembershipAwareRoleFilter", () => {
  test("should treat company_admin and university_admin as membership-aware eq filters", () => {
    expect(
      resolveMembershipAwareRoleFilter({
        filterField: "role",
        filterValue: "company_admin",
      }),
    ).toBe("company_admin")

    expect(
      resolveMembershipAwareRoleFilter({
        filterField: "role",
        filterValue: "university_admin",
      }),
    ).toBe("university_admin")
  })

  test("should ignore non-eq role operators and non-membership roles", () => {
    expect(
      resolveMembershipAwareRoleFilter({
        filterField: "role",
        filterValue: "company_admin",
        filterOperator: "ne",
      }),
    ).toBeUndefined()

    expect(
      resolveMembershipAwareRoleFilter({
        filterField: "role",
        filterValue: "student",
      }),
    ).toBeUndefined()
  })
})

describe("primary admin role helpers", () => {
  test("should exclude recruiters from the primary company_admin role", () => {
    expect(
      isPrimaryCompanyAdminRole({
        role: "company_admin",
        companyMemberRole: null,
      }),
    ).toBe(true)

    expect(
      isPrimaryCompanyAdminRole({
        role: "company_admin",
        companyMemberRole: "owner",
      }),
    ).toBe(true)

    expect(
      isPrimaryCompanyAdminRole({
        role: "company_admin",
        companyMemberRole: "recruiter",
      }),
    ).toBe(false)
  })

  test("should exclude department heads from the primary university_admin role", () => {
    expect(
      isPrimaryUniversityAdminRole({
        role: "university_admin",
        universityMembershipRole: null,
      }),
    ).toBe(true)

    expect(
      isPrimaryUniversityAdminRole({
        role: "university_admin",
        universityMembershipRole: "department_head",
      }),
    ).toBe(false)
  })
})