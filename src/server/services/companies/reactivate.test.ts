import { beforeEach, describe, expect, mock, test } from "bun:test"

let mockSelectResult: any[] = []

let mockReturningResult: any[] = []

const mockSelectLimit = mock(() => Promise.resolve(mockSelectResult))
const mockSelectWhere = mock(() => ({ limit: mockSelectLimit }))
const mockSelectFrom = mock(() => ({ where: mockSelectWhere }))
const mockSelect = mock(() => ({ from: mockSelectFrom }))

const mockReturning = mock(() => Promise.resolve(mockReturningResult))
const mockUpdateWhere = mock(() => ({ returning: mockReturning }))
const mockUpdateSet = mock(() => ({ where: mockUpdateWhere }))
const mockUpdate = mock(() => ({ set: mockUpdateSet }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
    update: mockUpdate,
  },
}))

describe("src/server/services/companies/reactivate", () => {
  beforeEach(() => {
    mockSelectResult = []
    mockReturningResult = []

    mockSelect.mockClear()
    mockSelectFrom.mockClear()
    mockSelectWhere.mockClear()
    mockSelectLimit.mockClear()

    mockUpdate.mockClear()
    mockUpdateSet.mockClear()
    mockUpdateWhere.mockClear()
    mockReturning.mockClear()
  })

  test("reactivates suspended companies", async () => {
    mockSelectResult = [{ id: "company-1", status: "suspended" }]
    mockReturningResult = [{ id: "company-1", name: "Acme Corp" }]

    const { reactivateCompany } = await import("./reactivate")
    const result = await reactivateCompany("company-1", "admin-1")

    expect(result).toEqual({ companyId: "company-1", name: "Acme Corp" })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("throws for missing company", async () => {
    mockSelectResult = []

    const { reactivateCompany } = await import("./reactivate")

    await expect(reactivateCompany("missing", "admin-1")).rejects.toEqual(
      expect.objectContaining({
        code: "COMPANY_NOT_FOUND",
      }),
    )
  })

  test("throws for invalid status transition", async () => {
    mockSelectResult = [{ id: "company-1", status: "approved" }]

    const { reactivateCompany } = await import("./reactivate")

    await expect(reactivateCompany("company-1", "admin-1")).rejects.toEqual(
      expect.objectContaining({
        code: "COMPANY_INVALID_STATUS_TRANSITION",
      }),
    )
  })
})
