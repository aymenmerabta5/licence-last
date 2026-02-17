import { beforeEach, describe, expect, mock, test } from "bun:test"
import type { CompanyStatus } from "@/lib/schemas/enums"

import { getMe } from "@/server/services/users/get-me"

interface CompanySummary {
  id: string
  name: string
  slug: string
  status: CompanyStatus
}

interface UniversitySummary {
  id: string
  name: string
  abbreviation: string
  status: string
  rejectionReason: string | null
}

const mockGetCompanyByUserId = mock<(userId: string) => Promise<CompanySummary | null>>(
  () => Promise.resolve(null),
)

const mockGetUniversityByUserId = mock<(userId: string) => Promise<UniversitySummary | null>>(
  () => Promise.resolve(null),
)

describe("src/server/services/users/get-me", () => {
  beforeEach(() => {
    mockGetCompanyByUserId.mockClear()
    mockGetCompanyByUserId.mockResolvedValue(null)
    mockGetUniversityByUserId.mockClear()
    mockGetUniversityByUserId.mockResolvedValue(null)
  })

  test("should default to student role and omit company data", async () => {
    const result = await getMe({
      id: "user-1",
      email: "user-1@example.com",
    }, {
      getCompanyByUserId: mockGetCompanyByUserId,
      getUniversityByUserId: mockGetUniversityByUserId,
    })

    expect(result.user.role).toBe("student")
    expect(result.user.name).toBeNull()
    expect(result.user.onboardingCompleted).toBe(false)
    expect(result.company).toBeNull()
    expect(mockGetCompanyByUserId).not.toHaveBeenCalled()
  })

  test("should include company summary for company_admins with membership", async () => {
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
    }, {
      getCompanyByUserId: mockGetCompanyByUserId,
      getUniversityByUserId: mockGetUniversityByUserId,
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
    mockGetCompanyByUserId.mockResolvedValue(null)

    const result = await getMe({
      id: "user-1",
      email: "user-1@example.com",
      role: "company_admin",
    }, {
      getCompanyByUserId: mockGetCompanyByUserId,
      getUniversityByUserId: mockGetUniversityByUserId,
    })

    expect(mockGetCompanyByUserId).toHaveBeenCalledWith("user-1")
    expect(result.company).toBeNull()
  })

  test("should not query company data for admins but query university", async () => {
    mockGetUniversityByUserId.mockResolvedValue({
      id: "uni-1",
      name: "University of Algiers",
      abbreviation: "USTHB",
      status: "approved",
      rejectionReason: null,
    })

    const result = await getMe({
      id: "user-1",
      email: "user-1@example.com",
      role: "university_admin",
    }, {
      getCompanyByUserId: mockGetCompanyByUserId,
      getUniversityByUserId: mockGetUniversityByUserId,
    })

    expect(result.user.role).toBe("university_admin")
    expect(result.company).toBeNull()
    expect(mockGetCompanyByUserId).not.toHaveBeenCalled()
    expect(mockGetUniversityByUserId).toHaveBeenCalledWith("user-1")
    expect(result.university).toEqual({
      id: "uni-1",
      name: "University of Algiers",
      abbreviation: "USTHB",
      status: "approved",
      rejectionReason: null,
    })
  })
})
