import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockReturningResult: any[] = []

const mockReturning = mock(() => Promise.resolve(mockReturningResult))
const mockWhere = mock(() => ({ returning: mockReturning }))
const mockSet = mock(() => ({ where: mockWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))

mock.module("@/server/db", () => ({
  db: {
    update: mockUpdate,
  },
}))

describe("src/server/services/companies/reject", () => {
  beforeEach(() => {
    mockReturningResult = []
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
  })

  test("should reject a company and return its id and name", async () => {
    mockReturningResult = [{ id: "company-1", name: "Bad Corp" }]

    const { rejectCompany } = await import("@/server/services/companies/reject")
    const result = await rejectCompany("company-1", "Incomplete documentation", "admin-1")

    expect(result).toEqual({ companyId: "company-1", name: "Bad Corp" })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should throw when company not found", async () => {
    mockReturningResult = []

    const { rejectCompany } = await import("@/server/services/companies/reject")

    await expect(rejectCompany("missing", "reason", "admin-1")).rejects.toThrow("Company not found")
  })
})
