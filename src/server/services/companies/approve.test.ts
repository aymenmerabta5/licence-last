import { beforeEach, describe, expect, mock, test } from "bun:test"

let mockReturningResult: any[] = []

let mockSelectResult: any[] = []

const mockReturning = mock(() => Promise.resolve(mockReturningResult))
const mockWhere = mock(() => ({ returning: mockReturning }))
const mockSet = mock(() => ({ where: mockWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))
const mockSelectLimit = mock(() => Promise.resolve(mockSelectResult))
const mockSelectWhere = mock(() => ({ limit: mockSelectLimit }))
const mockSelectFrom = mock(() => ({ where: mockSelectWhere }))
const mockSelect = mock(() => ({ from: mockSelectFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
    update: mockUpdate,
  },
}))

describe("src/server/services/companies/approve", () => {
  beforeEach(() => {
    mockReturningResult = []
    mockSelectResult = []
    mockSelect.mockClear()
    mockSelectFrom.mockClear()
    mockSelectWhere.mockClear()
    mockSelectLimit.mockClear()
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockSelect.mockReturnValue({ from: mockSelectFrom })
    mockSelectFrom.mockReturnValue({ where: mockSelectWhere })
    mockSelectWhere.mockReturnValue({ limit: mockSelectLimit })
    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
  })

  test("should approve a company and return its id and name", async () => {
    mockReturningResult = [{ id: "company-1", name: "Acme Corp" }]

    const { approveCompany } = await import(
      "@/server/services/companies/approve?fresh=1" as string
    )
    const result = await approveCompany("company-1", "admin-1")

    expect(result).toEqual({ companyId: "company-1", name: "Acme Corp" })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should throw when company not found", async () => {
    mockReturningResult = []
    mockSelectResult = []

    const { approveCompany } = await import(
      "@/server/services/companies/approve?fresh=2" as string
    )

    await expect(approveCompany("missing", "admin-1")).rejects.toThrow(
      "Company not found",
    )
  })

  test("should reject approving a company that is no longer pending", async () => {
    mockReturningResult = []
    mockSelectResult = [{ id: "company-1", status: "approved" }]

    const { approveCompany } = await import(
      "@/server/services/companies/approve?fresh=3" as string
    )

    await expect(approveCompany("company-1", "admin-1")).rejects.toThrow(
      "Only pending companies can be approved",
    )
  })
})
