import { describe, expect, mock, test } from "bun:test"

mock.module("@/server/db", () => ({
  db: {
    select: mock(() => {
      throw new Error("db.select should not be called in canAccessMatchScore tests")
    }),
  },
}))

describe("src/server/services/matching/score canAccessMatchScore", () => {
  test("should allow a student to access their own score only for visible offers", async () => {
    const { canAccessMatchScore } = await import("./score")

    expect(
      canAccessMatchScore(
        { id: "student-1", role: "student" },
        {
          studentUserId: "student-1",
          offerCompanyId: "company-1",
          isOfferVisibleToStudent: true,
        },
      ),
    ).toBe(true)

    expect(
      canAccessMatchScore(
        { id: "student-1", role: "student" },
        {
          studentUserId: "student-1",
          offerCompanyId: "company-1",
          isOfferVisibleToStudent: false,
        },
      ),
    ).toBe(false)
  })

  test("should deny student access to another student's score", async () => {
    const { canAccessMatchScore } = await import("./score")

    expect(
      canAccessMatchScore(
        { id: "student-2", role: "student" },
        {
          studentUserId: "student-1",
          offerCompanyId: "company-1",
          isOfferVisibleToStudent: true,
        },
      ),
    ).toBe(false)
  })

  test("should allow company admins only for their own company offer", async () => {
    const { canAccessMatchScore } = await import("./score")

    expect(
      canAccessMatchScore(
        { id: "company-admin-1", role: "company_admin" },
        {
          studentUserId: "student-1",
          offerCompanyId: "company-1",
          viewerCompanyId: "company-1",
          isOfferVisibleToStudent: false,
        },
      ),
    ).toBe(true)

    expect(
      canAccessMatchScore(
        { id: "company-admin-1", role: "company_admin" },
        {
          studentUserId: "student-1",
          offerCompanyId: "company-1",
          viewerCompanyId: "company-2",
          isOfferVisibleToStudent: false,
        },
      ),
    ).toBe(false)
  })
})
