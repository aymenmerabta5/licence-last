import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockLimitResult: any[] = []

const mockLimit = mock(() => Promise.resolve(mockLimitResult))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

describe("src/server/services/companies/membership", () => {
  beforeEach(() => {
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
    mockLimitResult = [{ companyId: "company-1", userId: "user-1", role: "owner" }]

    const { getCompanyMembership } = await import("./membership")
    const result = await getCompanyMembership("user-1")

    expect(result).not.toBeNull()
    expect(result?.companyId).toBe("company-1")
    expect(result?.role).toBe("owner")
  })

  test("should return null when user has no membership", async () => {
    mockLimitResult = []

    const { getCompanyMembership } = await import("./membership")
    const result = await getCompanyMembership("user-orphan")

    expect(result).toBeNull()
  })
})
