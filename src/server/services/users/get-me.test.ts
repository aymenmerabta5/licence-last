import { beforeEach, describe, expect, mock, test } from "bun:test"
import type { CompanyStatus } from "@/lib/schemas/enums"

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

interface UserSummary {
  id: string
  email: string
  role: string
  name: string | null
  image: string | null
}

const mockGetUserById = mock<(userId: string) => Promise<UserSummary | null>>(
  () => Promise.resolve(null),
)

const mockGetCompanyByUserId = mock<
  (userId: string) => Promise<CompanySummary | null>
>(() => Promise.resolve(null))

const mockGetUniversityByUserId = mock<
  (userId: string) => Promise<UniversitySummary | null>
>(() => Promise.resolve(null))

let getMeImportCounter = 0
async function importGetMe() {
  getMeImportCounter += 1
  return import(`@/server/services/users/get-me?test=${getMeImportCounter}`)
}

describe("src/server/services/users/get-me", () => {
  beforeEach(() => {
    mockGetUserById.mockClear()
    mockGetUserById.mockResolvedValue(null)
    mockGetCompanyByUserId.mockClear()
    mockGetCompanyByUserId.mockResolvedValue(null)
    mockGetUniversityByUserId.mockClear()
    mockGetUniversityByUserId.mockResolvedValue(null)
  })

  test("should default to student role and omit company data", async () => {
    const { getMe } = await importGetMe()
    const result = await getMe(
      {
        id: "user-1",
        email: "user-1@example.com",
      },
      {
        getUserById: mockGetUserById,
        getCompanyByUserId: mockGetCompanyByUserId,
        getUniversityByUserId: mockGetUniversityByUserId,
      },
    )

    expect(result.user.role).toBe("student")
    expect(result.user.name).toBeNull()
    expect(result.user.onboardingCompleted).toBe(false)
    expect(result.company).toBeNull()
    expect(mockGetCompanyByUserId).not.toHaveBeenCalled()
  })

  test("should include company summary for company_admins with membership", async () => {
    const { getMe } = await importGetMe()
    mockGetCompanyByUserId.mockResolvedValue({
      id: "company-1",
      name: "Acme",
      slug: "acme",
      status: "approved",
    })

    const result = await getMe(
      {
        id: "user-1",
        email: "user-1@example.com",
        role: "company_admin",
        onboardingCompleted: true,
      },
      {
        getUserById: mockGetUserById,
        getCompanyByUserId: mockGetCompanyByUserId,
        getUniversityByUserId: mockGetUniversityByUserId,
      },
    )

    expect(mockGetCompanyByUserId).toHaveBeenCalledWith("user-1")
    expect(result.company).toEqual({
      id: "company-1",
      name: "Acme",
      slug: "acme",
      status: "approved",
    })
  })

  test("should return null company when company_admin has no membership", async () => {
    const { getMe } = await importGetMe()
    mockGetCompanyByUserId.mockResolvedValue(null)

    const result = await getMe(
      {
        id: "user-1",
        email: "user-1@example.com",
        role: "company_admin",
      },
      {
        getUserById: mockGetUserById,
        getCompanyByUserId: mockGetCompanyByUserId,
        getUniversityByUserId: mockGetUniversityByUserId,
      },
    )

    expect(mockGetCompanyByUserId).toHaveBeenCalledWith("user-1")
    expect(result.company).toBeNull()
  })

  test("should not query company data for admins but query university", async () => {
    const { getMe } = await importGetMe()
    mockGetUniversityByUserId.mockResolvedValue({
      id: "uni-1",
      name: "University of Algiers",
      abbreviation: "USTHB",
      status: "approved",
      rejectionReason: null,
    })

    const result = await getMe(
      {
        id: "user-1",
        email: "user-1@example.com",
        role: "university_admin",
      },
      {
        getUserById: mockGetUserById,
        getCompanyByUserId: mockGetCompanyByUserId,
        getUniversityByUserId: mockGetUniversityByUserId,
      },
    )

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

  test("should prefer fresh DB-backed user fields over stale session fields", async () => {
    const { getMe } = await importGetMe()
    mockGetUserById.mockResolvedValue({
      id: "user-1",
      email: "fresh@example.com",
      role: "student",
      name: "Fresh Name",
      image: null,
    })

    const result = await getMe(
      {
        id: "user-1",
        email: "stale@example.com",
        role: "student",
        name: "Stale Name",
        image: "https://cdn.example.com/old.png",
      },
      {
        getUserById: mockGetUserById,
        getCompanyByUserId: mockGetCompanyByUserId,
        getUniversityByUserId: mockGetUniversityByUserId,
      },
    )

    expect(mockGetUserById).toHaveBeenCalledWith("user-1")
    expect(result.user.email).toBe("fresh@example.com")
    expect(result.user.role).toBe("student")
    expect(result.user.name).toBe("Fresh Name")
    expect(result.user.image).toBeNull()
  })
})
