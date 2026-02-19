import { beforeEach, describe, expect, mock, test } from "bun:test"

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

describe("src/server/services/companies/approve", () => {
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

  test("should approve a company and return its id and name", async () => {
    mockReturningResult = [{ id: "company-1", name: "Acme Corp" }]

    const { approveCompany } = await import(
      "@/server/services/companies/approve?fresh=1"
    )
    const result = await approveCompany("company-1", "admin-1")

    expect(result).toEqual({ companyId: "company-1", name: "Acme Corp" })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should throw when company not found", async () => {
    mockReturningResult = []

    const { approveCompany } = await import(
      "@/server/services/companies/approve?fresh=2"
    )

    await expect(approveCompany("missing", "admin-1")).rejects.toThrow(
      "Company not found",
    )
  })
})
