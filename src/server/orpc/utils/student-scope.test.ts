import { describe, expect, test } from "bun:test"
import {
  canAccessApplicationTimeline,
  canAccessPrivateStudentProfile,
} from "@/server/orpc/utils/student-scope"

const target = {
  userId: "student-1",
  universityId: "university-1",
  departmentId: "department-1",
}

describe("src/server/orpc/utils/student-scope canAccessPrivateStudentProfile", () => {
  test("allows same-university admins", () => {
    expect(
      canAccessPrivateStudentProfile(
        {
          id: "admin-1",
          role: "university_admin",
          universityId: "university-1",
        },
        target,
      ),
    ).toBe(true)
  })

  test("allows department heads only for their own department", () => {
    expect(
      canAccessPrivateStudentProfile(
        {
          id: "dept-head-1",
          role: "university_admin",
          universityId: "university-1",
          departmentId: "department-1",
          universityMembershipRole: "department_head",
        },
        target,
      ),
    ).toBe(true)

    expect(
      canAccessPrivateStudentProfile(
        {
          id: "dept-head-1",
          role: "university_admin",
          universityId: "university-1",
          departmentId: "department-2",
          universityMembershipRole: "department_head",
        },
        target,
      ),
    ).toBe(false)
  })
})

describe("src/server/orpc/utils/student-scope canAccessApplicationTimeline", () => {
  test("allows department heads only for their own department", () => {
    expect(
      canAccessApplicationTimeline(
        {
          id: "dept-head-1",
          role: "university_admin",
          universityId: "university-1",
          departmentId: "department-1",
          universityMembershipRole: "department_head",
        },
        target,
        "company-1",
      ),
    ).toBe(true)

    expect(
      canAccessApplicationTimeline(
        {
          id: "dept-head-1",
          role: "university_admin",
          universityId: "university-1",
          departmentId: "department-2",
          universityMembershipRole: "department_head",
        },
        target,
        "company-1",
      ),
    ).toBe(false)
  })
})
