import { describe, test, expect, beforeEach, mock } from "bun:test"

type CompanyStatus = "pending" | "approved" | "rejected" | "suspended"

interface CompanySummary {
  id: string
  name: string
  slug: string
  status: CompanyStatus
}

const mockGetCompanyByUserId = mock<(userId: string) => Promise<CompanySummary | null>>(
  () => Promise.resolve(null),
)

mock.module("@/server/services/companies/get", () => ({
  getCompanyByUserId: mockGetCompanyByUserId,
}))

describe("src/server/services/users/get-me", () => {
  beforeEach(() => {
    mockGetCompanyByUserId.mockClear()
    mockGetCompanyByUserId.mockResolvedValue(null)
  })

  test("should default to student role and omit company data", async () => {
    const { getMe } = await import("./get-me")

    const result = await getMe({
      id: "user-1",
      email: "user-1@example.com",
    })

    expect(result.user.role).toBe("student")
    expect(result.user.name).toBeNull()
    expect(result.user.onboardingCompleted).toBe(false)
    expect(result.company).toBeNull()
    expect(mockGetCompanyByUserId).not.toHaveBeenCalled()
  })

  test("should include company summary for company_admins with membership", async () => {
    const { getMe } = await import("./get-me")
    mockGetCompanyByUserId.mockResolvedValue({
      id: "company-1",
      name: "Acme",
      slug: "acme",
      status: "approved",
    })

    const result = await getMe({
      id: "user-1",
      email: "user-1@example.com",
      role: "company_admin",
      onboardingCompleted: true,
    })

    expect(mockGetCompanyByUserId).toHaveBeenCalledWith("user-1")
    expect(result.company).toEqual({
      id: "company-1",
      name: "Acme",
      slug: "acme",
      status: "approved",
    })
  })

  test("should return null company when company_admin has no membership", async () => {
    const { getMe } = await import("./get-me")
    mockGetCompanyByUserId.mockResolvedValue(null)

    const result = await getMe({
      id: "user-1",
      email: "user-1@example.com",
      role: "company_admin",
    })

    expect(mockGetCompanyByUserId).toHaveBeenCalledWith("user-1")
    expect(result.company).toBeNull()
  })

  test("should not query company data for admins", async () => {
    const { getMe } = await import("./get-me")

    const result = await getMe({
      id: "user-1",
      email: "user-1@example.com",
      role: "admin",
    })

    expect(result.user.role).toBe("admin")
    expect(result.company).toBeNull()
    expect(mockGetCompanyByUserId).not.toHaveBeenCalled()
  })
})

