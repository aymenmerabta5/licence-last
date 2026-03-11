import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockLimitResult: any[] = []

const mockLimit = mock(() => Promise.resolve(mockLimitResult))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))
let moduleImportCounter = 0

function applyMembershipMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
    },
  }))
}

async function loadMembershipModule() {
  moduleImportCounter += 1
  return import(
    `@/server/services/companies/membership?test=${moduleImportCounter}`
  )
}

describe("src/server/services/companies/membership", () => {
  beforeEach(() => {
    applyMembershipMocks()
    mockLimitResult = []
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
  })

  test("should return membership when user belongs to company", async () => {
    mockLimitResult = [
      { companyId: "company-1", userId: "user-1", role: "owner" },
    ]

    const { getCompanyMembership } = await loadMembershipModule()
    const result = await getCompanyMembership("user-1")

    expect(result).not.toBeNull()
    expect(result?.companyId).toBe("company-1")
    expect(result?.role).toBe("owner")
  })

  test("should return null when user has no membership", async () => {
    mockLimitResult = []

    const { getCompanyMembership } = await loadMembershipModule()
    const result = await getCompanyMembership("user-orphan")

    expect(result).toBeNull()
  })

  test("should throw when user has multiple memberships", async () => {
    mockLimitResult = [
      { companyId: "company-1", userId: "user-1", role: "owner" },
      { companyId: "company-2", userId: "user-1", role: "owner" },
    ]

    const { getCompanyMembership } = await loadMembershipModule()

    await expect(getCompanyMembership("user-1")).rejects.toMatchObject({
      code: "COMPANY_MEMBERSHIP_CONFLICT",
      message: "User belongs to multiple companies",
    })
  })
})
