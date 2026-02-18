import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockLimitResult: any[] = []

const mockLimit = mock(() => Promise.resolve(mockLimitResult))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockInnerJoin = mock(() => ({ where: mockWhere }))
const mockFrom = mock(() => ({ where: mockWhere, innerJoin: mockInnerJoin }))
const mockSelect = mock(() => ({ from: mockFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

describe("src/server/services/companies/get", () => {
  beforeEach(() => {
    mockLimitResult = []
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()
    mockInnerJoin.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere, innerJoin: mockInnerJoin })
    mockWhere.mockReturnValue({ limit: mockLimit })
    mockInnerJoin.mockReturnValue({ where: mockWhere })
  })

  test("getCompanyById should return company when found", async () => {
    mockLimitResult = [{ id: "company-1", name: "Acme Corp" }]

    const { getCompanyById } = await import("@/server/services/companies/get?fresh=1")
    const result = await getCompanyById("company-1")

    expect(result).not.toBeNull()
    expect(result?.id).toBe("company-1")
    expect(result?.name).toBe("Acme Corp")
  })

  test("getCompanyById should return null when not found", async () => {
    mockLimitResult = []

    const { getCompanyById } = await import("@/server/services/companies/get?fresh=2")
    const result = await getCompanyById("missing")

    expect(result).toBeNull()
  })

  test("getCompanyByUserId should return company when membership exists", async () => {
    mockLimitResult = [{ id: "company-1", name: "Acme Corp", slug: "acme-corp", status: "approved" }]

    const { getCompanyByUserId } = await import("@/server/services/companies/get?fresh=3")
    const result = await getCompanyByUserId("user-1")

    expect(result).not.toBeNull()
    expect(result?.id).toBe("company-1")
  })

  test("getCompanyByUserId should return null when no membership", async () => {
    mockLimitResult = []

    const { getCompanyByUserId } = await import("@/server/services/companies/get?fresh=4")
    const result = await getCompanyByUserId("user-orphan")

    expect(result).toBeNull()
  })

  test("getCompanyByUserId should throw when user has multiple memberships", async () => {
    mockLimitResult = [
      { id: "company-1", name: "Acme Corp", slug: "acme-corp", status: "approved" },
      { id: "company-2", name: "Beta Corp", slug: "beta-corp", status: "approved" },
    ]

    const { getCompanyByUserId } = await import("@/server/services/companies/get?fresh=5")

    await expect(getCompanyByUserId("user-1")).rejects.toMatchObject({
      code: "COMPANY_MEMBERSHIP_CONFLICT",
      message: "User belongs to multiple companies",
    })
  })
})
